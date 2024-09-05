import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10nTranslationModule, L10nIntlModule, L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { ReferenceService } from '../../services/reference.service';
import { CustomService } from '../../services/custom.service';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, EnvironmentConfig, FormField, LoaderService } from '@asseco/common-ui';
import { FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, tap } from 'rxjs';

@Component({
  selector: 'additional-data',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective],
  templateUrl: './additional-data.component.html',
  styleUrl: './additional-data.component.css'
})
export class AdditionalDataComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroupInitialized = false;
  public isIndividualEntity = false;
  public isRegistrationProcess = false;
  public isTest = false;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public treatmentOfClientInterestList: any = [];
  public accountManagerList: any = [];
  public sectoralDivisionUSSPOList: any = [];
  public marketingConsentList: any = [];
  public maxDate = new Date();
  public datePickerFlags: any = { treatmentDateValidFrom: true, tarrifDateValidFrom: true };
  public formKeys = [
    { key: 'treatmentOfClientInterest', validators: [Validators.required] },
    { key: 'treatmentDateValidFrom', validators: [Validators.required] },
    { key: 'tariffGroupOfClientCommissions', validators: [Validators.required] },
    { key: 'tarrifDateValidFrom', validators: [Validators.required] },
    { key: 'accountManager', validators: [] },
    { key: 'backupAccountManager', validators: [] },
    { key: 'classificationAccordingToNBS', validators: [] },
    { key: 'note', validators: [] },
    { key: 'sectoralDivisionUSSPO', validators: [Validators.required] },
    { key: 'riskLevel', validators: [] },
    { key: 'dateOfRiskLevel', validators: [] },
    { key: 'dateOfNextRiskLevel', validators: [] },
    { key: 'basisForClientRegistration', validators: [] },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;


  constructor(protected injector: Injector,
    private referenceService: ReferenceService,
    private customService: CustomService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    // Combine multiple HTTP requests using forkJoin
    forkJoin({
      treatmentOfClientInterestCategories: this.customService.getClassification('TRETMANK'),
      accountManagerCategories: this.customService.getClassification('ACC_MNG'),
      sectoralDivisionUSSPOCategories: this.customService.getClassification('KS3USEK'),
      marketingConsentListCategories: this.customService.getClassification('SAGMARK'),
      currencies: this.referenceService.getCurrencies()
    }).pipe(
      tap(({
        treatmentOfClientInterestCategories,
        accountManagerCategories,
        sectoralDivisionUSSPOCategories,
        marketingConsentListCategories }) => {

        treatmentOfClientInterestCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        accountManagerCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        sectoralDivisionUSSPOCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        marketingConsentListCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        this.treatmentOfClientInterestList = treatmentOfClientInterestCategories.items;
        this.accountManagerList = accountManagerCategories.items;
        this.sectoralDivisionUSSPOList = sectoralDivisionUSSPOCategories.items;
        this.marketingConsentList = marketingConsentListCategories.items;

      })
    ).subscribe();

    // Handle ActivatedRoute data as before
    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
      .subscribe((params) => {
        this.taskId = params[0]['taskId'];
        this.getTask();
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

  private initFormGroup() {
    this.formGroupInitialized = false;
    this.isIndividualEntity = this.getFormFieldValue('isIndividualEntity');
    this.isRegistrationProcess = this.getFormFieldValue('isRegistrationProcess');
    this.isTest = this.getFormFieldValue('isTest');
    this.formGroup = new FormGroup({});

    // Create controls
    this.formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    this.formGroup.controls['treatmentOfClientInterest'].valueChanges.subscribe(treatment => {
      this.formGroup.controls['treatmentDateValidFrom'].setValue(new Date());
    });

    this.formGroup.controls['tariffGroupOfClientCommissions'].valueChanges.subscribe(tarrif => {
      this.formGroup.controls['tarrifDateValidFrom'].setValue(new Date());
    });

    this.formGroup.controls['basisForClientRegistration'].valueChanges.subscribe(basis => {
      if (basis == "klijent") {
        this.formGroup.controls['accountManager'].addValidators(Validators.required)
      }
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


    if (this.isIndividualEntity) {
      const control = new AseeFormControl(this.getFormFieldValue('marketingConsent'), []);
      this.formGroup.addControl('marketingConsent', control);
    }

    if (this.isRegistrationProcess) {
      this.formGroup.controls['treatmentDateValidFrom'].setValue(new Date());
      this.formGroup.controls['tarrifDateValidFrom'].setValue(new Date());
    }
    console.log(this.formGroup)
    // this.formGroup.markAllAsTouched();
    this.formGroupInitialized = true;
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

  public clearDateOnEmptyInput(formControlName: string) {
    const hasErrors = this.formGroup.controls[formControlName].errors !== null;
    let hasParseErrors = false;
    let isEmptyText = false;

    const errors = this.formGroup.controls[formControlName].errors;

    if (errors?.['matDatepickerParse']) {
      hasParseErrors = errors['matDatepickerParse'];
      isEmptyText = errors['matDatepickerParse'].text === '';
    }
    // Clear control only when:
    if (hasErrors && hasParseErrors && isEmptyText) {
      this.datePickerFlags[formControlName] = false;
      this.formGroup.controls[formControlName].setValue(null);
      this.formGroup.controls[formControlName].updateValueAndValidity();

      setTimeout(() => {
        this.datePickerFlags[formControlName] = true;
      }, 0);
    }
  }

  // Method to mark control as touched
  markAsTouched(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

}
