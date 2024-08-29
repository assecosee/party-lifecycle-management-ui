import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, AuthService, BpmTasksHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { Observable, combineLatest, map } from 'rxjs';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'financial-data',
  standalone: true,
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent],
  templateUrl: './financial-data.component.html',
  styleUrl: './financial-data.component.scss'
})
export class FinancialDataComponent implements OnInit {

  public locale: L10nLocale;
  public taskId: string = "";
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized: boolean = false;
  public formKeys = [
    { key: 'clientCategory', validators: [] },
    { key: 'financialDataDate', validators: [] },
    { key: 'currency', validators: [] },
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
  public typeOfClient = "";
  public chosenCurrency = "";
  public maxDate = new Date();


  constructor(protected injector: Injector, protected http: HttpClient, protected authConfig: AuthService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    this.getAutocompleteData("https://apis-dev-aikbg.do.asee.dev/v1/custom/classification/JK2BNKRL", "description")
      .subscribe(data => {
        this.clientCategoryList = data;
        console.log('Client category List:', this.clientCategoryList);
      });

    this.getAutocompleteData("https://apis-dev-aikbg.do.asee.dev/v1/reference/currencies", "name")
      .subscribe(data => {
        this.currencyList = data;
        this.currencyList.map((element: any) => {
          return element['formatted-name'] = element['name'] + " - " + element['currency-code'] + " (" + element['currency-symbol'] + ")";
        })
        console.log('Currency List:', this.currencyList);
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

  private initFormGroup() {
    this.formGroup = new FormGroup({});

    this.formKeys.forEach(formKey => {
      if (formKey) {
        let controlValue = this.getFormFieldValue(formKey.key);
        const control = new AseeFormControl(controlValue, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    this.formGroup.controls['currency'].valueChanges.subscribe(newValue => {
      if (newValue && newValue != null && newValue['currency-symbol']) {
        this.chosenCurrency = newValue['currency-symbol'];
      }
    });

    this.formGroup.controls['grossIncome'].valueChanges.subscribe(newValue => {
      this.setValidatorsConditionally(newValue);
    });

    this.formGroup.controls['netIncome'].valueChanges.subscribe(newValue => {
      this.setValidatorsConditionally(newValue);
    });

    this.formGroupInitialized = true;
    console.log("Form group: ", this.formGroup);
  }
  public clearDate(event: any) {
    console.log(event);
  }

  private setValidatorsConditionally(newValue: any) {
    if ((this.formGroup.controls['grossIncome'].value == 0 || this.formGroup.controls['grossIncome'].value == null) && (this.formGroup.controls['netIncome'].value == 0 || this.formGroup.controls['grossIncome'].value == null)) {
      this.formGroup.controls['financialDataDate'].clearValidators();
      this.formGroup.controls['currency'].clearValidators();
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
