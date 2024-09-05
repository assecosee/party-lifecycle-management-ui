import { Component, Injector, OnInit } from '@angular/core';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, EnvironmentService, BpmTasksHttpClient, LoaderService, AseeFormControl, FormField } from '@asseco/common-ui';
import { forkJoin, tap, combineLatest, Observable, map } from 'rxjs';
import { ReferenceService } from '../../services/reference.service';
import { CustomValidatorsService } from '../../services/custom-validators.service';

@Component({
  selector: 'lib-identification-document',
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent],
  templateUrl: './identification-document.component.html',
  styleUrl: './identification-document.component.scss'
})
export class IdentificationDocumentComponent implements OnInit {

  public locale: L10nLocale;
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public formGroupInitialized = false;
  public formFields: FormField[] = [];
  public formGroup: FormGroup = new FormGroup({});
  public countriesList: any = [];
  public typeOfIdList: any = [];
  public idDocumentTypes: any = [];
  public registrationProcess = false;
  public taskId = '';
  public task: any;
  public formKeys = [
    { key: 'typeOfID', validators: [Validators.required] },
    { key: 'numberOfID', validators: [Validators.required] },
    { key: 'countryOfIssuing', validators: [Validators.required] },
    { key: 'placeOfIssuing', validators: [Validators.required] },
    { key: 'nameOfIdIssuer', validators: [] },
    { key: 'dateOfIssue', validators: [Validators.required, CustomValidatorsService.dateNotInFutureValidator()] },
    { key: 'idValidityPeriod', validators: [Validators.max(99), Validators.min(0)] },
    {
      key: 'idExpirationDate',
      validators:
        [Validators.required,
          CustomValidatorsService.futureDateValidator()]
    },
    { key: 'typeOfClient', validators: [] },
  ];

  constructor(
    protected injector: Injector,
    protected http: HttpClient,
    protected authConfig: AuthService,
    private referenceService: ReferenceService,

  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    // Combine multiple HTTP requests using forkJoin
    forkJoin({
      countries: this.referenceService.getCountries(),
    }).pipe(
      tap(({ countries }) => {
        this.countriesList = countries.items.filter((item: any) => item.name);
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
    this.formGroup.controls['countryOfIssuing'].valueChanges.subscribe(newValue => {
      console.log(newValue);
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

    if (this.getFormFieldValue('identificationTypes')) {
      this.idDocumentTypes = this.filterInUseIdentificationTypes(JSON.parse(this.getFormFieldValue('identificationTypes')));
    };

    if (this.formGroup.controls['typeOfClient'].value.name === '1') {
      this.formGroup.controls['countryOfIssuing'].setValue(this.findItemByProperty(this.countriesList, 'name', 'PORTUGALIJA'));
      this.formGroup.controls['countryOfIssuing'].updateValueAndValidity();
      this.formGroup.controls['countryOfIssuing'].markAsTouched();
      console.log('rs', this.formGroup.controls['countryOfIssuing'].value);

    }

    this.formGroup.controls['typeOfID'].valueChanges.subscribe(newValue => {
      this.setValidatorsConditionally(newValue);
    });


    this.formGroup.markAllAsTouched();
    this.formGroupInitialized = true;
  }

  private setValidatorsConditionally(newValue: any) {
    if (newValue && newValue.literal === 'national-id-card') {
      this.formGroup.controls['nameOfIdIssuer'].addValidators(Validators.required);
    } else {
      this.formGroup.controls['nameOfIdIssuer'].clearValidators();
    }

    this.formGroup.controls['nameOfIdIssuer'].updateValueAndValidity();
    this.formGroup.controls['nameOfIdIssuer'].markAsTouched();
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


  private filterInUseIdentificationTypes(identificationTypes: any) {
    // Use the `filter` method to return only items where `additional-fields.in-use` is "true"
    return identificationTypes.filter((item: any) => item['additional-fields']['in-use'] === 'true');
  }

  private findItemByProperty(arrayToSearch: Array<any>, propertyName: string, propertyValue: string) {
    if (!arrayToSearch) {
      return null;
    }

    for (const item of arrayToSearch) {
      if (item[propertyName] && item[propertyName].toLowerCase() === propertyValue.toLowerCase()) {
        return item;
      }
    }

    return null;
  }

}
