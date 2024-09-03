import { Component, DoCheck, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { catchError, combineLatest, forkJoin, of, tap } from 'rxjs';
import { CustomValidatorsService } from '../../services/custom-validators.service';
import { CustomService } from '../../services/custom.service';
import { ReferenceService } from '../../services/reference.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'lib-basic-data',
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective],
  templateUrl: './basic-data.component.html',
  styleUrl: './basic-data.component.scss'
})
export class BasicDataComponent implements OnInit, DoCheck {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized = false;
  public previousValue = null;
  public isIndividualPerson = -1;
  public formKeysIndividualPerson = [
    {
      key: 'registrationNumber',
      validators: [
        Validators.required,
        CustomValidatorsService.validateRegNumIndividualPerson()]
    },
    {
      key: 'clientName',
      validators: [
        Validators.required,
        CustomValidatorsService.onlyCharactersSpacesAndHyphensAllowed()]
    },
    {
      key: 'parentName',
      validators: [
        Validators.required,
        CustomValidatorsService.noSlashesAllowed(),
        CustomValidatorsService.onlyCharactersAllowed()]
    },
    {
      key: 'clientLastName',
      validators: [
        Validators.required,
        CustomValidatorsService.onlyCharactersSpacesAndHyphensAllowed()
      ]
    },
    {
      key: 'countryOfficialAddress',
      validators: [Validators.required]
    },
    {
      key: 'clientCitizenship',
      validators: [Validators.required]
    },
    {
      key: 'clientDateOfBirth',
      validators: [Validators.required]
    },
    {
      key: 'clientCountryOfBirth',
      validators: [Validators.required]
    },
    {
      key: 'clientActivity',
      validators: []
    },
  ];
  public formKeysLegalEntity = [
    {
      key: 'registrationNumber',
      validators:
        [
          Validators.required,
          CustomValidatorsService.validateRegNumLegalEntity()]
    },
    {
      key: 'organizationalPartOfCustomer',
      validators: []
    },
    {
      key: 'shortNameOfClient',
      validators: [Validators.required]
    }, ,
    {
      key: 'countryOfHeadquartersOfficialAddress',
      validators: [Validators.required]
    },
    {
      key: 'countryOfOrigin',
      validators: [Validators.required]
    },
    {
      key: 'subjectTypeInAPR',
      validators: []
    },
    {
      key: 'clientActivity',
      validators: []
    },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public typeOfClientList: any = [];
  public countriesList: any = [];
  public typeOfAPRList: any = [];
  public isRegistration = false;
  public maxDate = new Date();
  public showClientDateOfBirthPicker = true;
  // Store references and prefilled flags
  constructor(
    protected injector: Injector,
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
      typeOfClientList: this.customService.getClassification('JK2TIPKM'),
      typeOfAPRList: this.customService.getClassification('JK2APRTS'),
      countriesList: this.referenceService.getCountries()
    }).pipe(
      tap(({ typeOfClientList, typeOfAPRList, countriesList }) => {
        this.typeOfClientList = typeOfClientList.items.filter((item: any) => item.description);
        this.typeOfAPRList = typeOfAPRList.items.filter((item: any) => item.description);
        this.countriesList = countriesList.items.filter((item: any) => item.name);
      }),
      catchError(error => {
        console.error('Error fetching data:', error);
        return of(null); // Handle the error and return a fallback value if needed
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

  extractDateFromIDNumber(idNumber: string) {
    // Check if the ID number is valid and has at least 7 digits
    if (idNumber.length < 7) {
      return;
    }

    // Extract the first 7 digits
    const datePart = idNumber.substring(0, 7);

    // Split the date part into day, month, and year
    const day = datePart.substring(0, 2);
    const month = datePart.substring(2, 4);
    const year = datePart.substring(4, 7);

    // Convert the extracted parts to numbers
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);


    // Assume the year is in the format of 3 digits, so we add 1900
    const fullYear = (yearNum < 900 ? 2000 + yearNum : 1000 + yearNum);

    // Create a Date object
    const dateObj = new Date(fullYear, monthNum - 1, dayNum);

    // Validate the date
    if (dateObj.getDate() !== dayNum || dateObj.getMonth() !== (monthNum - 1) || dateObj.getFullYear() !== fullYear) {
      return;
    }

    // Format the date as dd.mm.yyyy
    this.formGroup.controls['clientDateOfBirth'].setValue(dateObj);

    return dateObj;
  }


  private initFormGroup(isInitial: boolean = false) {
    this.formGroupInitialized = false;
    let typeOfClientControl = new AseeFormControl(JSON.parse(this.getFormFieldValue('typeOfClient')), Validators.required) as any;

    // If init form group is not initial call then restore previous type of client
    if (!isInitial) {
      typeOfClientControl = this.formGroup.controls['typeOfClient'];
    }

    // Initialize empty form
    this.formGroup = new FormGroup({});
    this.formGroup.addControl('typeOfClient', typeOfClientControl);

    const notResidentClient = this.getFormFieldValue('notResident');
    const registration = this.getFormFieldValue('isRegistrationProcess');
    this.isRegistration = registration == null ? false : registration;
    const formKeys = this.formGroup.controls['typeOfClient'].value
      && this.formGroup.controls['typeOfClient'].value.value === '1' ? this.formKeysLegalEntity : this.formKeysIndividualPerson;

    // Create controls
    formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
        this.formGroup.controls[formKey.key].updateValueAndValidity();
      }
    });

    // On prefill mark control as touched
    if (this.formGroup.controls['registrationNumber'].value && this.formGroup.controls['registrationNumber'].value != null) {
      this.formGroup.controls['registrationNumber'].markAsTouched();
    }

    if (this.formGroup.controls['registrationNumber'].value
      && this.formGroup.controls['typeOfClient'].value
      && this.formGroup.controls['typeOfClient'].value.value === '0'
      && !notResidentClient) {
      this.formGroup.controls['clientDateOfBirth']
        .setValue(this.extractDateFromIDNumber(this.formGroup.controls['registrationNumber'].value.toString()));
    }

    this.formGroup.controls['registrationNumber'].valueChanges.subscribe(response => {
      if (this.formGroup.controls['registrationNumber'].value
        && this.formGroup.controls['registrationNumber'].valid
        && this.formGroup.controls['typeOfClient'].value
        && this.formGroup.controls['typeOfClient'].value.value === '0') {
        this.formGroup.controls['clientDateOfBirth']
          .setValue(this.extractDateFromIDNumber(this.formGroup.controls['registrationNumber'].value.toString()));
      }
    });

    // Add new control based on clientActivity
    this.formGroup.controls['clientActivity'].valueChanges.subscribe(clientActivity => {
      this.formGroup.removeControl('dateOfDeactivation');

      if (!clientActivity) {
        this.formGroup.addControl('dateOfDeactivation', new AseeFormControl(new Date()));
      }
    });

    if (this.isRegistration) {
      this.formGroup.controls['clientActivity'].setValue(true);
    }

    // Initialize controls with values (this is because some logic in control listeners must be triggered)
    // So this is the reason why creation and initialization are separated
    formKeys.forEach(formKey => {
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

  ngDoCheck() {
    if (this.formGroup.controls['typeOfClient']
      && this.formGroup.controls['typeOfClient'].value
      && this.previousValue !== this.formGroup.controls['typeOfClient'].value.value) {
      this.previousValue = this.formGroup.controls['typeOfClient'].value.value;
      this.initFormGroup(false);
    }
  }
}
