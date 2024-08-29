import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, AuthService, BpmTasksHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { Observable, combineLatest, map } from 'rxjs';
import { CustomValidatorsService } from '../../services/custom-validators.service';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';

@Component({
  selector: 'lib-basic-data',
  standalone: true,
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent],
  templateUrl: './basic-data.component.html',
  styleUrl: './basic-data.component.scss'
})
export class BasicDataComponent implements OnInit {

  public locale: L10nLocale;
  public taskId: string = "";
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized: boolean = false;
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
  public typeOfClient = "";
  public maxDate = new Date();

  constructor(protected injector: Injector, protected http: HttpClient, protected authConfig: AuthService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    this.getAutocompleteData("https://apis-dev-aikbg.do.asee.dev/v1/custom/classification/JK2TIPKM", "description")
      .subscribe(data => {
        this.typeOfClientList = data;
        console.log('Type of Client List:', this.typeOfClientList);
      });

    this.getAutocompleteData("https://apis-dev-aikbg.do.asee.dev/v1/custom/classification/JK2APRTS", "description")
      .subscribe(data => {
        this.typeOfAPRList = data;
        console.log('Type of APR List:', this.typeOfAPRList);
      });

    this.getAutocompleteData("https://apis-dev-aikbg.do.asee.dev/v1/reference/countries", "name")
      .subscribe(data => {
        this.countriesList = data;
        console.log('Countries List:', this.countriesList);
      });

    const activatedRoute = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]);
    activatedRoute.subscribe((params) => {
      this.taskId = params[0]['taskId'];
      this.getTask();
    });
  }

  public getTask() {
    this.bpmTaskService.getTask(this.taskId).build().subscribe((task) => {
      this.task = task;
      console.log("Task data: ", this.task)
      this.bpmTaskService.getFormData(this.taskId).build().subscribe((result) => {
        this.formFields = result;
        console.log("Form data: ", this.formFields);
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
    const formattedDate = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${fullYear}`;
    this.formGroup.controls['clientDateOfBirth'].setValue(dateObj);

    return dateObj;
  }


  private initFormGroup() {
    this.formGroup = new FormGroup({});
    const registration = this.getFormFieldValue("isRegistrationProcess");
    const clientType = this.getFormFieldValue("clientType");
    const notResidentClient = this.getFormFieldValue("notResident");
    this.isRegistration = registration == null ? false : registration;
    this.typeOfClient = clientType == null ? "natural" : clientType;
    const formKeys = this.typeOfClient == "legal" ? this.formKeysLegalEntity : this.formKeysNaturalPerson;

    formKeys.forEach(formKey => {
      if (formKey) {
        let controlValue = this.getFormFieldValue(formKey.key);
        const control = new AseeFormControl(controlValue, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    // On prefill mark control as touched
    if (this.formGroup.controls['registrationNumber'].value && this.formGroup.controls['registrationNumber'].value != null) {
      this.formGroup.controls['registrationNumber'].markAsTouched();
    }

    if (this.formGroup.controls['registrationNumber'].value && this.typeOfClient == "natural" && !notResidentClient) {
      this.formGroup.controls['clientDateOfBirth'].setValue(this.extractDateFromIDNumber(this.formGroup.controls['registrationNumber'].value))
    }

    this.formGroup.controls['registrationNumber'].valueChanges.subscribe(response => {
      if (!this.formGroup.controls['registrationNumber'].invalid && this.typeOfClient == "natural") {
        this.formGroup.controls['clientDateOfBirth'].setValue(this.extractDateFromIDNumber(this.formGroup.controls['registrationNumber'].value))
      }
    })

    if (this.isRegistration) {
      this.formGroup.controls['clientActivity'].setValue(true);
    }

    this.formGroupInitialized = true;
    console.log("Form group: ", this.formGroup);
  }

  private getFormFieldValue(formField: string) {
    if (!formField) {
      return null;
    }

    for (let i = 0; i < this.formFields.length; i++) {
      if (this.formFields[i].id == formField) {
        return this.formFields[i].data?.value;
      }
    }

    return null;
  }

  private getAutocompleteData(url: string, propertyToCheck: string): Observable<any[]> {
    const headers = this.attachHeaders();
    return this.http.get<{ items: any[] }>(url, { headers }).pipe(
      map((res: { items: any[] }) => {
        // Filter out objects where the specified property is null
        // This is must because core autocomplete component breaks if the found property is null
        return res.items.filter(item => item[propertyToCheck] !== null);
      })
    );
  }

  private attachHeaders(): HttpHeaders {
    const token = this.authConfig.getAccessToken();
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Bearer ' + token);
    return headers;
  }

  public submit() {
    this.loaderService.showLoader();
    this.bpmTaskService.complete(this.taskId, this.formGroup).build().subscribe((res) => {
      this.loaderService.stopLoader();
      console.log("Result after submit: ", res)
    });
  }

}
