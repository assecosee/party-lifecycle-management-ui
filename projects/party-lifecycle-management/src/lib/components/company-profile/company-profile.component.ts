import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, AuthService, BpmTasksHttpClient, EnvironmentService, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { Observable, combineLatest, forkJoin, map, tap } from 'rxjs';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'lib-company-profile',
  standalone: true,
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.scss'
})
export class CompanyProfileComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formFields: FormField[] = [];
  public formGroup: FormGroup = new FormGroup({});
  public formGroupInitialized = false;
  public maxDate = new Date();
  public activityCodeList: any = [];
  public codeOfBranchPredominantActivityList: any = [];
  public statusOfLegalEntityList: any = [];
  public sizeOfLegalEntityList: any = [];
  public typeOfPropertyList: any = [];
  public naceCodeList: any = [];
  public crmIndCodeList: any = [];
  public registrationProcess = false;
  public formKeysLegalEntity = [
    { key: 'dateOfRegistration', validators: [Validators.required] },
    { key: 'activityCode', validators: [] },
    { key: 'alignmentWithApr', validators: [] },
    { key: 'registrationNumber', validators: [Validators.maxLength(1)] },
    { key: 'codeOfBranchPredominantActivity', validators: [] },
    { key: 'statusOfLegalEntity', validators: [Validators.required] },
    { key: 'sizeOfLegalEntity', validators: [] },
    { key: 'typeOfProperty', validators: [] },
    { key: 'bicCode', validators: [] },
    { key: 'emirLei', validators: [] },
    { key: 'naceCodeCustomer', validators: [] },
    { key: 'naceCodeRisk', validators: [] },
    { key: 'crmIndCode', validators: [] },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;

  constructor(protected injector: Injector, protected http: HttpClient, protected authConfig: AuthService, private envService: EnvironmentService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    // Combine multiple HTTP requests using forkJoin
    const apiVersion = this.bpmTaskService.getApiVersion();
    const baseUrl = this.envService.baseUrl;
    console.log('base', baseUrl)

    forkJoin({
      activityCodeList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/DELATNOS`, 'name'),
      codeOfBranchPredominantActivityList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/GRANA`, 'description'),
      statusOfLegalEntityList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/JK2PRSTS`, 'description'),
      sizeOfLegalEntityList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/JK2VMS`, 'description'),
      typeOfPropertyList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/SVOJINA`, 'description'),
      naceCodeList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/JK2NACE`, 'description'),
      crmIndCodeList: this.getAutocompleteData(`${baseUrl}/${apiVersion}/custom/classification/JK2CRMIC`, 'description')
    }).pipe(
      tap(response => {
        // Assign the received data to your component properties
        this.activityCodeList = response.activityCodeList;
        this.codeOfBranchPredominantActivityList = response.codeOfBranchPredominantActivityList;
        this.statusOfLegalEntityList = response.statusOfLegalEntityList;
        this.sizeOfLegalEntityList = response.sizeOfLegalEntityList;
        this.typeOfPropertyList = response.typeOfPropertyList;
        this.naceCodeList = response.naceCodeList;
        this.crmIndCodeList = response.crmIndCodeList;
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
      this.bpmTaskService.getFormData(this.taskId).build().subscribe((result) => {
        this.formFields = result;
        console.log('Form data: ', this.formFields);
        this.initFormGroup();
      });
    });
  }

  private initFormGroup() {
    this.formGroup = new FormGroup({});
    this.registrationProcess = this.getFormFieldValue('isRegistrationProcess');
    const residentClientLegalEntity = this.getFormFieldValue('resident');

    this.formKeysLegalEntity.forEach(formKey => {
      if (formKey) {
        const controlValue = this.getFormFieldValue(formKey.key);
        const control = new AseeFormControl(controlValue, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    if (residentClientLegalEntity) {
      this.formGroup.controls['activityCode'].addValidators(Validators.required);
    }

    if (this.registrationProcess) {
      this.formGroup.controls['alignmentWithApr'].setValue(true);
      this.formGroup.controls['codeOfBranchPredominantActivity'].disable();
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

  // Method to mark control as touched
  markAsTouched(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (control) {
      control.markAsTouched();
    }
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
