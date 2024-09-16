import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AseeFormControl,
  BpmTasksHttpClient,
  ConfigurationHttpClient,
  FormField,
  LoaderService,
} from '@asseco/common-ui';
import {
  AssecoMaterialModule,
  MaterialAutocompleteComponent,
  MaterialModule,
} from '@asseco/components-ui';
import {
  L10N_LOCALE,
  L10nIntlModule,
  L10nLocale,
  L10nTranslationModule,
} from 'angular-l10n';
import { catchError, combineLatest, forkJoin, of } from 'rxjs';
import { CustomValidatorsService } from '../../services/custom-validators.service';
import { CustomService } from '../../services/custom.service';
import { ReferenceService } from '../../services/reference.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'lib-basic-data',
  standalone: true,
  imports: [
    AssecoMaterialModule,
    L10nTranslationModule,
    L10nIntlModule,
    MaterialModule,
    ErrorHandlingComponent,
    MaterialCustomerActionsComponent,
    UppercaseDirective,
  ],
  templateUrl: './general-registration-data.component.html',
  styleUrl: './general-registration-data.component.scss',
})
export class GeneralRegistrationDataComponent implements OnInit {
  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized = false;
  public isIndividualPerson = false;
  @ViewChild('lang', { static: false })
  public lang: MaterialAutocompleteComponent | undefined;
  public formKeysIndividualPerson = [
    {
      key: 'dateOfActivation',
      validators: [Validators.required],
    },
    {
      key: 'organizationUnit',
      validators: [Validators.required],
    },
    {
      key: 'language',
      validators: [Validators.required],
    },
    {
      key: 'parentLastName',
      validators: [
        CustomValidatorsService.noSlashesAllowed(),
        CustomValidatorsService.onlyCharactersAllowed(),
        CustomValidatorsService.parentLastNameRequired('gender', 'maritalStatus'),
      ],
    },
    {
      key: 'clientCountryOfBirth',
      validators: [Validators.required],
    },
    {
      key: 'gender',
      validators: [Validators.required],
    },
    {
      key: 'maritalStatus',
      validators: [],
    },
    {
      key: 'propertyOwnership',
      validators: [],
    },
    {
      key: 'onAddressFrom',
      validators: [],
    },
    {
      key: 'householdMembers',
      validators: [],
    },
    {
      key: 'children',
      validators: [],
    },
    {
      key: 'employedHouseholdMembers',
      validators: [],
    },
    {
      key: 'dependentHouseholdMembers',
      validators: [],
    },
    {
      key: 'dateOfDeath',
      validators: [],
    },
    {
      key: 'nonResidentCode',
      validators: [CustomValidatorsService.nonResidentCodeValidator()],
    },
    {
      key: 'nonResidentDateOfActivation',
      validators: [],
    },
    {
      key: 'taxNumber',
      validators: [],
    },
    {
      key: 'bapoCode',
      validators: [],
    },
  ];
  public formKeysLegalEntity = [
    {
      key: 'fullClientName',
      validators: [Validators.required],
    },
    {
      key: 'dateOfActivation',
      validators: [Validators.required],
    },
    {
      key: 'organizationUnit',
      validators: [Validators.required],
    },
    {
      key: 'language',
      validators: [Validators.required],
    },
    {
      key: 'nonResidentCode',
      validators: [CustomValidatorsService.nonResidentCodeValidator()],
    },
    {
      key: 'nonResidentDateOfActivation',
      validators: [],
    },
    {
      key: 'taxNumber',
      validators: [],
    },
    {
      key: 'email',
      validators: [Validators.email],
    },
    {
      key: 'bapoCode',
      validators: [],
    },
  ];
  public genderOptions = [
    { value: 'male', label: 'male' },
    { value: 'female', label: 'female' },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public languages: any = [];
  public martialStatus: any = [];
  public ownership: any = [];
  public countriesList: any = [];
  public organizationUnits: any = [];
  public notResidentCodesList: any = [];
  public isRegistration = false;
  public notResidentClient = false;
  public showClientDateOfBirthPicker = true;
  // Store references and prefilled flags
  constructor(
    protected injector: Injector,
    protected configurationService: ConfigurationHttpClient,
    private referenceService: ReferenceService,
    private customService: CustomService
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    forkJoin([
      this.customService.getClassification('JO2ORGJED').pipe(
        catchError((error) => {
          console.error('Error fetching organizationUnits:', error);
          return of({ items: [] });
        })
      ),
      this.customService.getClassification('JG2JEZCH').pipe(
        catchError((error) => {
          console.error('Error fetching languages:', error);
          return of({ items: [] });
        })
      ),
      this.customService.getClassification('BRACNOST').pipe(
        catchError((error) => {
          console.error('Error fetching martialStatus:', error);
          return of({ items: [] });
        })
      ),
      this.customService.getClassification('JK2VLSTN').pipe(
        catchError((error) => {
          console.error('Error fetching ownership:', error);
          return of({ items: [] });
        })
      ),
      this.referenceService.getCountries().pipe(
        catchError((error) => {
          console.error('Error fetching countriesList:', error);
          return of({ items: [] });
        })
      ),
      this.configurationService
        .getEffective('party-lcm/basic-data-not-resident-codes')
        .build()
        .pipe(
          catchError((error) => {
            console.error('Error fetching notResidentCodes:', error);
            return of('{}');
          })
        ),
    ]).subscribe(
      ([
        organizationUnits,
        languages,
        martialStatus,
        ownership,
        countriesList,
        notResidentCodes,
      ]) => {
        // Now process the responses
        this.organizationUnits = organizationUnits.items.filter(
          (item: any) => item.description
        );
        this.languages = languages.items.filter(
          (item: any) => item.description
        );
        this.martialStatus = martialStatus.items.filter(
          (item: any) => item.description
        );
        this.ownership = ownership.items.filter(
          (item: any) => item.description
        );
        this.countriesList = countriesList.items.filter(
          (item: any) => item.name
        );
        this.notResidentCodesList =
          JSON.parse(notResidentCodes)['not-resident-codes'];
      }
    );

    // Handle ActivatedRoute data as before
    combineLatest([
      this.activatedRoute.params,
      this.activatedRoute.queryParams,
    ]).subscribe((params) => {
      this.taskId = params[0]['taskId'];
      this.getTask();
    });
    this.initFormGroup(true);
  }

  public getTask() {
    this.bpmTaskService
      .getTask(this.taskId)
      .build()
      .subscribe((task) => {
        this.task = task;
        console.log('Task data: ', this.task);
        this.bpmTaskService
          .getFormData(this.taskId)
          .build()
          .subscribe((result) => {
            this.formFields = result;
            console.log('Form data: ', this.formFields);
            // Populate form group with controls received from task
            this.initFormGroup(true);
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

  private initFormGroup(isInitial: boolean = false) {
    this.formGroupInitialized = false;
    const isLegalEntity = JSON.parse(this.getFormFieldValue('isLegalEntity'));

    // Initialize empty form
    this.formGroup = new FormGroup({});
    this.notResidentClient = JSON.parse(this.getFormFieldValue('notResident'));

    const formKeys = isLegalEntity
      ? this.formKeysLegalEntity
      : this.formKeysIndividualPerson;

    this.isIndividualPerson = isLegalEntity ? false : true;

    // Create controls
    formKeys.forEach((formKey) => {
      if (formKey) {
        let controlValue = null;
        try {
          controlValue = JSON.parse(this.getFormFieldValue(formKey.key));
        } catch (e) {
          controlValue = this.getFormFieldValue(formKey.key);
        }
        if (formKey.key === 'dateOfActivation') {
          controlValue = new Date();
        }
        if (
          formKey.key === 'nonResidentDateOfActivation' &&
          this.notResidentClient
        ) {
          controlValue = new Date();
        }
        if (formKey.key === 'language' && !this.notResidentClient) {
          controlValue = this.languages.find((item: any) => item.name === 'SR');
          this.lang?.controlInternal.setValue(controlValue);
        }
        if (
          formKey.key === 'gender' &&
          !this.notResidentClient &&
          this.getFormFieldValue('registrationNumber')
        ) {
          controlValue =
            this.genderOptions[
              this.checkGender(this.getFormFieldValue('registrationNumber'))
            ]?.value;
        }
        const control = new AseeFormControl(controlValue, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
        this.formGroup.controls[formKey.key].updateValueAndValidity();
      }
    });

    this.formGroup.controls['gender']?.valueChanges.subscribe(() => {
      this.formGroup.controls['parentLastName'].updateValueAndValidity();
    });

    this.formGroup.controls['maritalStatus']?.valueChanges.subscribe(() => {
      this.formGroup.controls['parentLastName'].updateValueAndValidity();
    });

    if (!isInitial) {
      this.formGroup.markAllAsTouched();
    }
    this.formGroupInitialized = true;

    console.log('Form group: ', this.formGroup);
  }

  private getFormFieldValue(formField: string) {
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

  private checkGender(number: string) {
    const num = parseInt(number.substring(8, 11), 10);
    if (num >= 0 && num <= 499) {
      return 0;
    }
    return 1;
  }
}
