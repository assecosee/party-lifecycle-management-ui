import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AseeFormControl,
  BpmTasksHttpClient,
  FormField, LoaderService
} from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { combineLatest, forkJoin, tap } from 'rxjs';
import { CustomService } from '../../services/custom.service';
import { ReferenceService } from '../../services/reference.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { CustomValidatorsService } from '../../services/custom-validators.service';

@Component({
  selector: 'financial-data',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective],
  templateUrl: './financial-data.component.html',
  styleUrl: './financial-data.component.scss'
})
export class FinancialDataComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formKeys = [
    { key: 'clientCategory', validators: [CustomValidatorsService.checkUndefined()] },
    { key: 'financialDataDate', validators: [] },
    { key: 'currency', validators: [CustomValidatorsService.checkUndefined()] },
    { key: 'grossIncome', validators: [] },
    { key: 'netIncome', validators: [] },
    { key: 'financialDataChangeOperator', validators: [] },
    { key: 'financialDataModificationTime', validators: [] },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public clientCategoryList: any = [];
  public currencyList: any = [];
  public isRegistration = false;
  public typeOfClient = '';
  public chosenCurrency = '';
  public showDatePicker = true;
  public maxDate = new Date();
  public formGroupInitialized = false;

  constructor(
    private referenceService: ReferenceService,
    private customService: CustomService,
    protected injector: Injector,
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    // Combine multiple HTTP requests using forkJoin
    forkJoin({
      clientCategories: this.customService.getClassification('JK2BNKRL'),
      currencies: this.referenceService.getCurrencies()
    }).pipe(
      tap(({ clientCategories, currencies }) => {

        clientCategories.items.map((element: any) =>
          element.formattedName = `${element.name}`
        );

        currencies.items.map((element: any) =>
          element.formattedName = `${element.name} - ${element.currencyCode} (${element.currencySymbol})`
        );

        this.currencyList = currencies.items;
        this.clientCategoryList = clientCategories.items;

      })
    ).subscribe(response => {
      // Handle ActivatedRoute data as before
      combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
        .subscribe((params) => {
          this.taskId = params[0]['taskId'];
          this.getTask();
        });
    });
  }

  public getTask() {
    this.bpmTaskService.getTask(this.taskId).build().subscribe((task) => {
      this.task = task;
      console.log('Task data: ', this.task);
      this.bpmTaskService.getFormData(this.taskId).build().subscribe((result) => {
        this.formFields = result;
        console.log('Form data: ', this.formFields);
        this.initFormGroup();
      });
    });
  }

  // Method to mark control as touched
  markAsTouched(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

  public clearDateOnEmptyInput() {
    const hasErrors = this.formGroup.controls['financialDataDate'].errors !== null;
    let hasParseErrors = false;
    let isEmptyText = false;

    if (this.formGroup.controls['financialDataDate'].errors && this.formGroup.controls['financialDataDate'].errors['matDatepickerParse']) {
      hasParseErrors = this.formGroup.controls['financialDataDate'].errors['matDatepickerParse'];
      isEmptyText = this.formGroup.controls['financialDataDate'].errors['matDatepickerParse'].text === '';
    }

    // Clear control only when:
    if (hasErrors && hasParseErrors && isEmptyText) {
      this.showDatePicker = false;
      this.formGroup.controls['financialDataDate'].setValue(null);
      this.formGroup.controls['financialDataDate'].updateValueAndValidity();

      setTimeout(() => {
        this.showDatePicker = true;
      }, 0);
    }
  }

  private initFormGroup() {
    this.formGroupInitialized = false;
    this.formGroup = new FormGroup({});

    // Create controls
    this.formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    // Add value change listeners
    this.formGroup.controls['currency'].valueChanges.subscribe(newValue => {
      if (newValue && newValue != null && newValue.currencySymbol) {
        this.chosenCurrency = newValue.currencySymbol;
      }
    });

    this.formGroup.controls['grossIncome'].valueChanges.subscribe(newValue => {
      this.setValidatorsConditionally('grossIncome', newValue);
    });

    this.formGroup.controls['netIncome'].valueChanges.subscribe(newValue => {
      this.setValidatorsConditionally('netIncome', newValue);
    });

    // Initialize controls with values (this is because some logic in control listeners must be triggered)
    // So this is the reason why creation and initialization are separated
    this.formKeys.forEach(formKey => {
      if (formKey) {
        let controlValue = null;
        try {
          controlValue = JSON.parse(this.getFormFieldValue(formKey.key));
        } catch (e) {
          controlValue = this.getFormFieldValue(formKey.key);
        }
        this.formGroup.controls[formKey.key].setValue(controlValue);
        this.formGroup.controls[formKey.key].updateValueAndValidity();
      }
    });

    this.formGroup.markAllAsTouched();
    this.formGroupInitialized = true;
  }

  private setValidatorsConditionally(controlName: string, newValue: any) {
    if (newValue < 0) {
      this.formGroup.controls[controlName].setValue(newValue * -1);
    }

    if (this.formGroup.controls['grossIncome'].value == null || (parseFloat(this.formGroup.controls['grossIncome'].value) === 0) &&
      (this.formGroup.controls['netIncome'].value == null || (parseFloat(this.formGroup.controls['netIncome'].value) === 0))) {
      this.formGroup.controls['financialDataDate'].clearValidators();
      if (this.formGroup.controls['currency'].hasValidator(Validators.required)) {
        this.formGroup.controls['currency'].removeValidators(Validators.required);
      }
    }

    if (newValue > 0) {
      this.formGroup.controls['financialDataDate'].addValidators(Validators.required);
      this.formGroup.controls['currency'].addValidators(Validators.required);
    }

    this.formGroup.controls['financialDataDate'].updateValueAndValidity();
    this.formGroup.controls['currency'].updateValueAndValidity();

    // Mark as touched in order to show validation error immidiately
    this.formGroup.controls['financialDataDate'].markAsTouched();
    this.formGroup.controls['currency'].markAsTouched();
  }

  private getFormFieldValue(formField: any) {
    if (!formField) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.formFields.length; i++) {
      if (this.formFields[i].id === formField) {
        return this.formFields[i].data?.value;
      }
    }

    return null;
  }

}
