import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, DoCheck, Injector, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, AuthService, BpmTasksHttpClient, EnvironmentService, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { Observable, combineLatest, forkJoin, map, tap } from 'rxjs';
import { CustomValidatorsService } from '../../services/custom-validators.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'lib-basic-data',
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent],
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
  public formKeysNaturalPerson = [
    { key: 'typeOfClient', validators: [Validators.required] },
    { key: 'registrationNumber', validators: [Validators.required, CustomValidatorsService.validateRegNumNaturalPerson()] },
    { key: 'clientName', validators: [Validators.required] },
    { key: 'parentName', validators: [Validators.required, CustomValidatorsService.noSlashesAllowed()] },
    { key: 'clientLastName', validators: [Validators.required] },
    { key: 'countryOfficialAddress', validators: [Validators.required] },
    { key: 'clientCitizenship', validators: [Validators.required] },
    { key: 'clientDateOfBirth', validators: [Validators.required] },
    { key: 'clientCountryOfBirth', validators: [Validators.required] },
    { key: 'clientActivity', validators: [] },
  ];
  public formKeysLegalEntity = [
    { key: 'typeOfClient', validators: [Validators.required] },
    { key: 'registrationNumber', validators: [Validators.required, CustomValidatorsService.validateTaxNumber()] },
    { key: 'organizationalPartOfCustomer', validators: [] },
    { key: 'shortNameOfClient', validators: [Validators.required] }, ,
    { key: 'countryOfHeadquartersOfficialAddress', validators: [Validators.required] },
    { key: 'countryOfOrigin', validators: [Validators.required] },
    { key: 'subjectTypeInAPR', validators: [] },
    { key: 'clientActivity', validators: [] },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public typeOfClientList: any = [];
  public countriesList: any = [];
  public typeOfAPRList: any = [];
  public isRegistration = false;
  public typeOfClient = '';
  public maxDate = new Date();
  public showClientDateOfBirthPicker: boolean = true;
  // Store references and prefilled flags
  private controlReferences: { [key: string]: any } = {};
  private controlPrefilledFlags: { [key: string]: boolean } = {};

  // Generic ViewChild setter method
  private setControlReference(controlName: string, content: any) {
    if (content) { // initially setter gets called with undefined
      this.controlReferences[controlName] = content;
      this.controlPrefilledFlags[controlName] = false; // Initialize prefilled flag as false
    }
  }

  // ViewChild setters
  @ViewChild('typeOfClientAutocomplete', { static: false }) set typeOfClientAutocompleteSetter(content: any) {
    this.setControlReference('typeOfClientAutocomplete', content);
  }
  @ViewChild('countryOfficialAddressAutocomplete', { static: false }) set countryOfficialAddressAutocompleteSetter(content: any) {
    this.setControlReference('countryOfficialAddressAutocomplete', content);
  }
  @ViewChild('clientCitizenshipAutocomplete', { static: false }) set clientCitizenshipAutocompleteSetter(content: any) {
    this.setControlReference('clientCitizenshipAutocomplete', content);
  }
  @ViewChild('clientCountryOfBirthAutocomplete', { static: false }) set clientCountryOfBirthAutocompleteSetter(content: any) {
    this.setControlReference('clientCountryOfBirthAutocomplete', content);
  }
  @ViewChild('countryOfHqOfficialAddressAutocomplete', { static: false }) set countryOfHqOfficialAddressAutocompleteSetter(content: any) {
    this.setControlReference('countryOfHqOfficialAddressAutocomplete', content);
  }
  @ViewChild('clientDateOfBirthPicker', { static: false }) set clientDateOfBirthPickerSetter(content: any) {
    this.setControlReference('clientDateOfBirthPicker', content);
  }
  @ViewChild('countryOfOriginAutocomplete', { static: false }) set countryOfOriginAutocompleteSetter(content: any) {
    this.setControlReference('countryOfOriginAutocomplete', content);
  }
  @ViewChild('subjectTypeInAPRAutocomplete', { static: false }) set subjectTypeInAPRAutocompleteSetter(content: any) {
    this.setControlReference('subjectTypeInAPRAutocomplete', content);
  }

  constructor(
    protected injector: Injector,
    protected http: HttpClient,
    protected authConfig: AuthService,
    private cdr: ChangeDetectorRef,
    private envService: EnvironmentService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    const apiVersion = this.bpmTaskService.getApiVersion();
    const baseUrl = this.envService.baseUrl;
    // Combine multiple HTTP requests using forkJoin
    forkJoin({
      typeOfClientList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/JK2TIPKM`, 'description'),
      typeOfAPRList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/JK2APRTS`, 'description'),
      countriesList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/reference/countries`, 'name')
    }).pipe(
      tap(response => {
        this.typeOfClientList = response.typeOfClientList;
        this.countriesList = response.countriesList;
        this.typeOfAPRList = response.typeOfAPRList;
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


  private initFormGroup() {
    this.formGroup = new FormGroup({});
    const registration = this.getFormFieldValue('isRegistrationProcess');
    const clientType = this.getFormFieldValue('clientType');
    const notResidentClient = this.getFormFieldValue('notResident');
    this.isRegistration = registration == null ? false : registration;
    this.typeOfClient = clientType == null ? 'natural' : clientType;
    const formKeys = this.typeOfClient === 'legal' ? this.formKeysLegalEntity : this.formKeysNaturalPerson;

    formKeys.forEach(formKey => {
      if (formKey) {
        const controlValue = this.getFormFieldValue(formKey.key);
        const control = new AseeFormControl(controlValue, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    // On prefill mark control as touched
    if (this.formGroup.controls['registrationNumber'].value && this.formGroup.controls['registrationNumber'].value != null) {
      this.formGroup.controls['registrationNumber'].markAsTouched();
    }

    if (this.formGroup.controls['registrationNumber'].value && this.typeOfClient === 'natural' && !notResidentClient) {
      this.formGroup.controls['clientDateOfBirth']
        .setValue(this.extractDateFromIDNumber(this.formGroup.controls['registrationNumber'].value));
    }

    this.formGroup.controls['registrationNumber'].valueChanges.subscribe(response => {
      if (!this.formGroup.controls['registrationNumber'].invalid && this.typeOfClient === 'natural') {
        this.formGroup.controls['clientDateOfBirth']
          .setValue(this.extractDateFromIDNumber(this.formGroup.controls['registrationNumber'].value));
      }
    });

    if (this.isRegistration) {
      this.formGroup.controls['clientActivity'].setValue(true);
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

  private getAutocompleteData(url: string, propertyToCheck: string): Observable<any[]> {
    const headers = this.attachHeaders();
    return this.http.get<{ items: any[] }>(url, { headers }).pipe(
      map((res: { items: any[] }) =>
        // Filter out objects where the specified property is null
        // This is must because core autocomplete component breaks if the found property is null
        res.items.filter(item => item[propertyToCheck] !== null)
      )
    );
  }

  private attachHeaders(): HttpHeaders {
    const token = this.authConfig.getAccessToken();
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Bearer ' + token);
    return headers;
  }

  ngDoCheck() {
    this.prefillFields([
      { control: 'clientDateOfBirthPicker', isDate: true, field: 'clientDateOfBirth' },
      { control: 'subjectTypeInAPRAutocomplete', list: 'typeOfAPRList', field: 'subjectTypeInAPR' },
      { control: 'countryOfOriginAutocomplete', list: 'countriesList', field: 'countryOfOrigin' },
      { control: 'countryOfficialAddressAutocomplete', list: 'countriesList', field: 'countryOfficialAddress' },
      { control: 'clientCitizenshipAutocomplete', list: 'countriesList', field: 'clientCitizenship' },
      { control: 'clientCountryOfBirthAutocomplete', list: 'countriesList', field: 'clientCountryOfBirth' },
      { control: 'countryOfHqOfficialAddressAutocomplete', list: 'countriesList', field: 'countryOfHeadquartersOfficialAddress' },
      { control: 'typeOfClientAutocomplete', list: 'typeOfClientList', field: 'typeOfClient' },
    ]);
  }
  private prefillFields(configs: Array<{ control: string, list?: string, field?: string, isDate?: boolean }>) {
    configs.forEach(config => {
      const { control, list, field, isDate } = config;

      // Skip if already prefilled
      if (this.controlPrefilledFlags[control]) return;

      // Check if control exists and list (if applicable) has items
      if ((this.controlReferences as any)[control] && (!list || ((this as any)[list] as any[]).length > 0) && this.formFields.length > 0) {
        if (isDate) {
          // Set value for date picker
          this.prefillDatePickerField((this.controlReferences as any)[control], this.getFormFieldValue(field!))
        } else {
          // Set value for autocomplete field
          this.prefillAutocompleteField((this.controlReferences as any)[control], field!, this.getFormFieldValue(field!));
        }
        this.controlPrefilledFlags[control] = true;  // Mark as prefilled
      }
    });
  }

  private prefillDatePickerField(viewChild: any, controlValue: any) {
    viewChild['controlDate'].setValue(controlValue);
  }

  private prefillAutocompleteField(viewChild: any, controlName: any, controlValue: any) {
    const selMatOption = viewChild.autocomplete.options.toArray()
      .find((o: any) => {
        return JSON.stringify(o.value) === controlValue
      });

    // If option found
    if (selMatOption) {
      // Select autocomplete option
      selMatOption?.select();

      // Set view child internal control
      viewChild.controlInternal.setValue(JSON.parse(controlValue))
      viewChild.controlInternal.updateValueAndValidity({ emitEvent: true })
      viewChild.optionSelected.emit(JSON.parse(controlValue))

      // Set form control
      this.formGroup.controls[controlName].setValue(JSON.parse(controlValue));
      this.formGroup.controls[controlName].updateValueAndValidity({ emitEvent: true })
    }

  }

}
