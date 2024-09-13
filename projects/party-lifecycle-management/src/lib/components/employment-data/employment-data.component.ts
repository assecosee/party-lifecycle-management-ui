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
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'employment-data',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective],
  templateUrl: './employment-data.component.html',
  styleUrl: './employment-data.component.scss'
})
export class EmploymentDataComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formKeys = [
    { key: 'employmentStatus', validators: [Validators.required] },
    { key: 'legalStatusOfIndividualPerson', validators: [] },
    { key: 'companyRegistrationNumber', validators: [] },
    { key: 'companyOrganizationPart', validators: [] },
    { key: 'companyRegisteredName', validators: [] },
    { key: 'occupationTitle', validators: [] },
    { key: 'employedSince', validators: [] },
    { key: 'workExperience', validators: [] },
    { key: 'levelOfEducation', validators: [] },
    { key: 'companyPositionCode', validators: [] },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public showDatePicker = true;
  public maxDate = new Date();
  public formGroupInitialized = false;
  public employmentStatusList: any = [];
  public legalStatusList: any = [];
  public levelOfEducationList: any = [];
  public companyPositionCodeList: any = [];
  public previousCompany = null;
  public controlsEnabled = true;

  constructor(
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
      employmentStatuses: this.customService.getClassification('STATLIC1'),
      legalStatuses: this.customService.getClassification('JK2PRSTF'),
      levelsOfEducation: this.customService.getClassification('STRUCNOS'),
      companyPositionCodes: this.customService.getClassification('POZZAPOS'),
    }).pipe(
      tap(({ employmentStatuses, legalStatuses, levelsOfEducation, companyPositionCodes }) => {

        employmentStatuses.items.filter((item: any) => item.name).map((element: any) =>
          element.formattedName = element.description ? `${element.name} - ${element.description}` : element.name);

        legalStatuses.items.filter((item: any) => item.name).map((element: any) =>
          element.formattedName = element.description ? `${element.name} - ${element.description}` : element.name);

        levelsOfEducation.items.filter((item: any) => item.name).map((element: any) =>
          element.formattedName = element.description ? `${element.name} - ${element.description}` : element.name);

        companyPositionCodes.items.filter((item: any) => item.name).map((element: any) =>
          element.formattedName = element.description ? `${element.name} - ${element.description}` : element.name);

        this.employmentStatusList = employmentStatuses.items;
        this.legalStatusList = legalStatuses.items;
        this.levelOfEducationList = levelsOfEducation.items;
        this.companyPositionCodeList = companyPositionCodes.items;

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

    this.formGroup.addControl('searchCompany', new AseeFormControl(null));

    this.formGroup.controls['searchCompany'].valueChanges.subscribe(value => {
      if ((typeof value) === 'string' && value === '') {
        this.controlsEnabled = true;

        this.formGroup.controls['companyRegistrationNumber'].setValue('');
        this.formGroup.controls['companyRegistrationNumber'].updateValueAndValidity();

        this.formGroup.controls['companyRegisteredName'].setValue('');
        this.formGroup.controls['companyRegisteredName'].updateValueAndValidity();
      }

      if ((typeof value) === 'object' && value !== null && value !== this.previousCompany) {
        this.previousCompany = value;

        // Prefill samo ako je u pitanju organizacija
        if (value.customer.kind === 'organization') {
          this.controlsEnabled = false;

          this.formGroup.controls['companyRegistrationNumber'].setValue(value.primaryId.number);
          this.formGroup.controls['companyRegistrationNumber'].updateValueAndValidity();

          this.formGroup.controls['companyRegisteredName'].setValue(value.registeredName);
          this.formGroup.controls['companyRegisteredName'].updateValueAndValidity();
        }
      }
    });

    this.formGroup.markAllAsTouched();
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

}
