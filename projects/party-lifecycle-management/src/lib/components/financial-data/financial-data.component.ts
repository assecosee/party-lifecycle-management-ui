import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, AuthService, BpmTasksHttpClient,
  EnvironmentConfig, EnvironmentService, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { Observable, combineLatest, forkJoin, map, tap } from 'rxjs';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'financial-data',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent],
  templateUrl: './financial-data.component.html',
  styleUrl: './financial-data.component.scss'
})
export class FinancialDataComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized = false;
  public formKeys = [
    { key: 'clientCategory', validators: [], autocomplete: [] },
    { key: 'financialDataDate', validators: [] },
    { key: 'currency', validators: [], autocomplete: [] },
    { key: 'grossIncome', validators: [] },
    { key: 'netIncome', validators: [] },
    { key: 'financialDataChangeOperator', validators: [] },
    { key: 'financialDataModificationTime', validators: [] },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  protected environmentConfig: EnvironmentConfig;
  public clientCategoryList: any = [];
  public currencyList: any = [];
  public isRegistration = false;
  public typeOfClient = '';
  public chosenCurrency = '';
  public showDatePicker = true;
  public maxDate = new Date();
  @ViewChild('dateInput', { static: false }) dateInput!: any;
  @ViewChild('clientCategoryAutocomplete', { static: false }) clientCategoryAutocomplete!: any;
  @ViewChild('currencyAutocomplete', { static: false }) currencyAutocomplete!: any;

  constructor(
    protected injector: Injector,
    protected http: HttpClient,
    protected authConfig: AuthService,
    private envService: EnvironmentService)
  {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.environmentConfig = injector.get(EnvironmentConfig);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    const apiVersion = this.bpmTaskService.getApiVersion();
    const baseUrl = this.envService.baseUrl;
    // Combine multiple HTTP requests using forkJoin
    forkJoin({
      clientCategories: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/JK2BNKRL`, 'description'),
      currencies: this.getAutocompleteData(`${baseUrl}/${apiVersion}/reference/currencies`, 'name')
    }).pipe(
      tap(({ clientCategories, currencies }) => {

        clientCategories.map((element: any) =>
          element['formatted-name'] = `${element.name})`
        );

        currencies.map((element: any) =>
          element['formatted-name'] = `${element.name} - ${element['currency-code']} (${element['currency-symbol']})`
        );

        this.setAutocompleteList('clientCategory', clientCategories);
        this.setAutocompleteList('currency', currencies);
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
    let hasErrors = this.formGroup.controls['financialDataDate'].errors != null;
    let hasParseErrors = this.formGroup.controls['financialDataDate'].errors!['matDatepickerParse'];
    let isEmptyText = this.formGroup.controls['financialDataDate'].errors!['matDatepickerParse'].text == "";

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
    this.formGroup = new FormGroup({});

    this.formKeys.forEach(formKey => {
      if (formKey) {
        let controlValue = this.getFormFieldValue(formKey);
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

    this.prefillAutocompleteField(this.clientCategoryAutocomplete, 'clientCategory', this.formGroup.controls['clientCategory'].value)
    this.prefillAutocompleteField(this.currencyAutocomplete, 'currency', this.formGroup.controls['currency'].value)
    this.prefillDateField(this.dateInput, this.formGroup.controls['financialDataDate'].value)

    this.formGroupInitialized = true;
  }

  private setValidatorsConditionally(newValue: any) {
    if (this.formGroup.controls['grossIncome'].value == null || (parseFloat(this.formGroup.controls['grossIncome'].value) === 0) &&
      (this.formGroup.controls['netIncome'].value == null || (parseFloat(this.formGroup.controls['netIncome'].value) === 0))) {
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

  public getFormKeyObjByKeyName(keyName: string) {
    for (let i = 0; i < this.formKeys.length; i++) {
      if (this.formKeys[i].key == keyName) {
        return this.formKeys[i];
      }
    }
    return null;
  }

  private prefillDateField(viewChild: any, controlValue: any) {
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

  private isAutocompleteField(keyName: string) {
    let keyObj = this.getFormKeyObjByKeyName(keyName);

    if (keyObj == null) {
      return false;
    }

    if (keyObj['autocomplete']) {
      return true;
    }

    return false;
  }

  private setAutocompleteList(key: string, autocompleteList: any) {
    let keyObj = this.getFormKeyObjByKeyName(key);

    if (keyObj == null) {
      return;
    }

    keyObj.autocomplete = autocompleteList;
  }

  private getFormFieldValue(formField: any) {
    if (!formField) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.formFields.length; i++) {
      if (this.formFields[i].id === formField.key) {
        return this.formFields[i].data?.value;
      }
    }

    return null;
  }

  private isJsonStringObject(str: any) {
    if (typeof str !== "string") {
      return false;
    }

    try {
      const parsed = JSON.parse(str);
      // Check if parsed value is an object and not null (typeof null is "object")
      if (typeof parsed === "object" && parsed !== null) {
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
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

}
