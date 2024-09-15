import { Component, Injector, OnInit } from '@angular/core';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, BpmTasksHttpClient, LoaderService, AseeFormControl, FormField, ErrorEmitterService } from '@asseco/common-ui';
import { forkJoin, tap, combineLatest } from 'rxjs';
import { ReferenceService } from '../../services/reference.service';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';

@Component({
  selector: 'lib-identification-document',
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective, ReactiveFormsModule],
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
  public limitDate = new Date();
  public idExpirationDateDisabled = false;
  public form: FormGroup;
  protected router: Router;

  public formKeys = [
    { key: 'typeOfID', validators: [Validators.required] },
    { key: 'numberOfID', validators: [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')] },
    { key: 'countryOfIssuing', validators: [Validators.required] },
    { key: 'placeOfIssuing', validators: [Validators.required] },
    { key: 'nameOfIdIssuer', validators: [] },
    { key: 'dateOfIssue', validators: [Validators.required] },
    { key: 'idValidityPeriod', validators: [Validators.max(99), Validators.min(0)] },
    {
      key: 'idExpirationDate',
      validators:
        [Validators.required]
    },
    { key: 'typeOfClient', validators: [] },
  ];

  constructor(
    protected injector: Injector,
    protected http: HttpClient,
    private referenceService: ReferenceService,
    protected errorEmitterService: ErrorEmitterService,
    private fb: FormBuilder,
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
    this.form = this.fb.group({
      groups: this.fb.array([])  // Initialize FormArray to hold groups
    });
    this.router = this.injector.get(Router);
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
  };

  get groups(): FormArray {
    return this.form.get('groups') as FormArray;
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

    const identificationList = JSON.parse(this.getFormFieldValue('identificationList'));
    // if (identificationList && identificationList.length > 0) {
    if (!identificationList) {
      this.initEmptyFormGroup();
      return;
    }

    identificationList.forEach((id: any) => {
      const fg: FormGroup = new FormGroup({});
      this.formKeys.forEach(formKey => {
        if (formKey) {
          const control = new AseeFormControl(null, formKey.validators);
          fg.addControl(formKey.key, control);
          fg.controls[formKey.key].setValue(id[formKey.key]);
          fg.controls[formKey.key].updateValueAndValidity();
        }
      });
      this.updateValueAndValidateControls(fg);
    });

    this.formGroupInitialized = true;

  }

  private updateValueAndValidateControls(fg: FormGroup) {
    if (this.getFormFieldValue('identificationTypes')) {
      this.idDocumentTypes = this.filterInUseIdentificationTypes(JSON.parse(this.getFormFieldValue('identificationTypes')));
    };

    if (fg.controls['typeOfClient'].value.name === '1') {
      fg.controls['countryOfIssuing'].setValue(this.findItemByProperty(this.countriesList, 'alpha2', 'RS'));
      fg.controls['countryOfIssuing'].updateValueAndValidity();
      fg.controls['countryOfIssuing'].markAsTouched();
    }

    fg.controls['typeOfID'].valueChanges.subscribe((newValue: any) => {
      this.setValidatorsConditionally(newValue, fg);
    });


    fg.markAllAsTouched();


    fg.controls['idValidityPeriod'].valueChanges.subscribe((newValue: any) => {
      if (fg.controls['dateOfIssue'].value && fg.controls['idValidityPeriod'].value) {
        fg.controls['idExpirationDate'].setValue(this.addYearsToDate(fg.controls['dateOfIssue'].value,
          fg.controls['idValidityPeriod'].value));
        this.idExpirationDateDisabled = true;
      }
    });

    fg.controls['dateOfIssue'].valueChanges.subscribe((newValue: any) => {
      if (fg.controls['idValidityPeriod'].value && fg.controls['dateOfIssue'].value) {
        fg.controls['idExpirationDate'].setValue(this.addYearsToDate(fg.controls['dateOfIssue'].value,
          fg.controls['idValidityPeriod'].value));
        this.idExpirationDateDisabled = true;
      }
    });

    this.groups.push(fg);
  }

  private initEmptyFormGroup() {
    this.formGroup = new FormGroup({});
    // Create controls
    this.formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

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

    this.updateValueAndValidateControls(this.formGroup);
    this.formGroupInitialized = true;

  }

  public addGroup() {
    this.initEmptyFormGroup();
  }

  public removeGroup() {
    this.groups.controls.pop();
    this.groups.updateValueAndValidity();
  }

  private setValidatorsConditionally(newValue: any, fg: FormGroup) {
    if (newValue && newValue.literal === 'national-id-card') {
      fg.controls['nameOfIdIssuer'].addValidators(Validators.required);
    } else {
      fg.controls['nameOfIdIssuer'].clearValidators();
    }

    fg.controls['nameOfIdIssuer'].updateValueAndValidity();
    fg.controls['nameOfIdIssuer'].markAsTouched();
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

  // private filterIdentificationTypesLeftToAdd() {
  //   const usedIdTypes: any = [];
  //   this.groups.controls.forEach((fg: any) => {
  //     usedIdTypes.push(fg.controls["typeOfID"].value.literal);
  //   });
  //   this.idDocumentTypes = this.idDocumentTypes.filter((obj: any) => !usedIdTypes.includes(obj.literal));
  // }

  private addYearsToDate(date: Date, yearsToAdd: number): Date {
    // Create a new Date object to avoid mutating the original date
    const newDate = new Date(date);

    // Add the years to the current year
    newDate.setFullYear(newDate.getFullYear() + yearsToAdd);

    return newDate;
  }

  public onSubmit() {
    this.formGroup = new FormGroup({});
    this.modifyControlsBeforeSubmit();
    this.formGroup.addControl('identificationList', new AseeFormControl(this.groups.value));
    this.bpmTaskService.complete(this.task.id, this.formGroup)
      .build().subscribe((res) => {
        this.router.navigateByUrl('tasks');
      },
        (err) => {
          this.errorEmitterService.setError(err);
        }
      );
  }

  public modifyControlsBeforeSubmit() {
    // Go through each date and subtract time zone (sending one date before current problem)
    this.groups.controls.forEach((formGroup: any) => {
      Object.keys(formGroup.controls).forEach((key) => {
        const control = formGroup.get(key);
        if ((typeof control.value) === 'string') {
          control.value = control.value.toUpperCase();
          control.updateValueAndValidity();
        }

        if (control.value instanceof Date) {
          const options = { timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit' };
          const belgradeDateString = control.value.toLocaleDateString('en-CA', options); // 'en-CA' outputs in YYYY-MM-DD format
          control.value = belgradeDateString;
          control.updateValueAndValidity();
        }
      });
    });

  }
}
