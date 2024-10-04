/* eslint-disable @typescript-eslint/dot-notation */
import { Component, DoCheck, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, ConfigurationHttpClient, FormField, LoaderService } from '@asseco/common-ui';
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
  public isIndividualPerson = false;
  public formKeysIndividualPerson = [
    {
      key: 'identificationNumber',
      validators: [
        Validators.required,
        CustomValidatorsService.validateRegNumIndividualPerson()]
    },
    {
      key: 'clientName',
      validators: [
        Validators.required,
        CustomValidatorsService.onlyCharactersAndHyphensAllowed()]
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
        CustomValidatorsService.onlyCharactersAndHyphensAllowed()
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
    {
      key: 'dateOfDeactivation',
      validators: []
    },
    {
      key: 'notResident',
      validators: []
    }
  ];
  public formKeysLegalEntity = [
    {
      key: 'identificationNumber',
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
    {
      key: 'dateOfDeactivation',
      validators: []
    },
    {
      key: 'notResident',
      validators: []
    }
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public typeOfClientList: any = [];
  public countriesList: any = [];
  public typeOfAPRList: any = [];
  public notResidentCodesList: any = [];
  public isRegistration = false;
  public notResidentClient = false;
  public maxDate = new Date();
  public showClientDateOfBirthPicker = true;
  public initalDataSet = false;
  // Store references and prefilled flags
  constructor(
    protected injector: Injector,
    protected configurationService: ConfigurationHttpClient,
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
      countriesList: this.referenceService.getCountries(),
      notResidentCodes: this.configurationService.getEffective('party-lcm/basic-data-not-resident-codes').build()
    }).pipe(
      tap(({ typeOfClientList, typeOfAPRList, countriesList, notResidentCodes }) => {
        typeOfClientList.items.filter((item: any) => item.name).map((element: any) =>
          element.formattedName = element.description ? `${element.name} - ${element.description}` : element.name);
        this.typeOfClientList = typeOfClientList.items;
        this.typeOfAPRList = typeOfAPRList.items.filter((item: any) => item.description);
        this.countriesList = countriesList.items.filter((item: any) => item.name);
        this.notResidentCodesList = JSON.parse(notResidentCodes)['not-resident-codes'];
      }),
      catchError(error => {
        console.error('Error fetching data:', error);
        return of(null); // Handle the error and return a fallback value if needed
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
        // Populate form group with controls received from task
        this.initFormGroup(true);
        const partyRefObj = JSON.parse(this.formFields.find(o => o.id === 'partyReference')?.data?.value);
        const isIndividual = partyRefObj['party-kind'];
        if (isIndividual === 'individual') {
          this.typeOfClientList = this.typeOfClientList.filter((obj: { value: string;
            description: string; name: string;formattedName: string;}) => obj?.value === '0');
        }
        else {
          this.typeOfClientList = this.typeOfClientList.filter((obj: { value: string;
            description: string; name: string;formattedName: string;}) => obj?.value === '1');
        }
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

    this.notResidentClient = false;
    const registration = this.getFormFieldValue('isRegistrationProcess');
    this.isRegistration = registration == null ? false : registration;
    const formKeys = this.formGroup.controls['typeOfClient'].value
      && this.formGroup.controls['typeOfClient'].value.value === '1' ? this.formKeysLegalEntity : this.formKeysIndividualPerson;
    this.isIndividualPerson = this.formGroup.controls['typeOfClient'].value
      && this.formGroup.controls['typeOfClient'].value.value === '1' ? false : true;

    if (this.formGroup.controls['typeOfClient'].value
      && this.notResidentCodesList.includes(this.formGroup.controls['typeOfClient'].value.name)) {
      this.notResidentClient = true;
    }

    // Create controls
    formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
        this.formGroup.controls[formKey.key].updateValueAndValidity();
      }
    });

    // On prefill mark control as touched
    if (this.formGroup.controls['identificationNumber'].value && this.formGroup.controls['identificationNumber'].value != null) {
      this.formGroup.controls['identificationNumber'].markAsTouched();
    }

    if (this.formGroup.controls['identificationNumber'].value
      && this.formGroup.controls['typeOfClient'].value
      && this.formGroup.controls['typeOfClient'].value.value === '0'
      && !this.notResidentClient) {
      this.formGroup.controls['clientDateOfBirth']
        .setValue(this.extractDateFromIDNumber(this.formGroup.controls['identificationNumber'].value.toString()));
    }

    this.formGroup.controls['identificationNumber'].valueChanges.subscribe(response => {
      if (this.formGroup.controls['identificationNumber'].value
        && this.formGroup.controls['identificationNumber'].valid
        && this.formGroup.controls['typeOfClient'].value
        && this.formGroup.controls['typeOfClient'].value.value === '0') {
        this.formGroup.controls['clientDateOfBirth']
          .setValue(this.extractDateFromIDNumber(this.formGroup.controls['identificationNumber'].value.toString()));
      }
    });

    // Add new control based on clientActivity
    this.formGroup.controls['clientActivity'].valueChanges.subscribe(clientActivity => {
      if (!clientActivity) {
        this.formGroup.controls['dateOfDeactivation'].setValue(new Date());
      } else {
        this.formGroup.controls['dateOfDeactivation'].setValue(null);
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

    this.formGroup.controls['notResident'].setValue(this.notResidentClient);

    // For non resident clients set default country (REPUBLIKA SRBIJA)
    if (!this.notResidentClient) {
      if (this.isIndividualPerson) {
        this.formGroup.controls['countryOfficialAddress']
          ?.setValue(this.findItemByProperty(this.countriesList, 'name', 'REPUBLIKA SRBIJA'));
        this.formGroup.controls['clientCitizenship']
          ?.setValue(this.findItemByProperty(this.countriesList, 'name', 'REPUBLIKA SRBIJA'));
      } else {
        this.formGroup.controls['countryOfHeadquartersOfficialAddress']
          ?.setValue(this.findItemByProperty(this.countriesList, 'name', 'REPUBLIKA SRBIJA'));
        this.formGroup.controls['countryOfOrigin']
          ?.setValue(this.findItemByProperty(this.countriesList, 'name', 'REPUBLIKA SRBIJA'));
      }
    }


    if (!isInitial) {
      this.formGroup.markAllAsTouched();
    }

    if (this.notResidentClient) {
      this.formGroup.controls['identificationNumber'].clearValidators();
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

  ngDoCheck() {
    if (this.formGroup.controls['typeOfClient']
      && this.formGroup.controls['typeOfClient'].value
      && this.previousValue !== this.formGroup.controls['typeOfClient'].value.name) {
      this.previousValue = this.formGroup.controls['typeOfClient'].value.name;
      this.initFormGroup(false);
    }
  }
}
