import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, AuthService, BpmTasksHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { combineLatest, forkJoin, tap } from 'rxjs';
import { CustomService } from '../../services/custom.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';

@Component({
  selector: 'lib-company-profile',
  standalone: true,
  imports: [
    AssecoMaterialModule,
    L10nTranslationModule,
    L10nIntlModule, MaterialModule,
    ErrorHandlingComponent,
    MaterialCustomerActionsComponent,
    UppercaseDirective],
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
  public isRegistrationProcess = false;
  public formKeysLegalEntity = [
    { key: 'dateOfRegistration', validators: [Validators.required] },
    { key: 'activityCode', validators: [] },
    { key: 'alignmentWithApr', validators: [] },
    { key: 'registrationNumber', validators: [] },
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

  constructor(
    protected injector: Injector,
    protected http: HttpClient,
    protected authConfig: AuthService,
    private customService: CustomService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {

    forkJoin({
      activityCodeList: this.customService.getClassification('DELATNOS'),
      codeOfBranchPredominantActivityList: this.customService.getClassification('DELATNOS'),
      statusOfLegalEntityList: this.customService.getClassification('JK2PRSTS'),
      sizeOfLegalEntityList: this.customService.getClassification('JK2VMS'),
      typeOfPropertyList: this.customService.getClassification('SVOJINA'),
      naceCodeList: this.customService.getClassification('JK2NACE'),
      crmIndCodeList: this.customService.getClassification('JK2CRMIC')
    }).pipe(
      tap(response => {
        // Assign the received data to your component properties

        this.activityCodeList = response.activityCodeList.items
          .filter((item: any) => item.name)
          .map((element: any) => ({
            ...element,
            formattedName: element.description ? `${element.name} - ${element.description}` : element.name
          }));

        this.codeOfBranchPredominantActivityList = response.codeOfBranchPredominantActivityList.items
          .filter((item: any) => item.description)
          .map((element: any) => ({
            ...element,
            formattedName: element.name ? `${element.name} - ${element.description}` : element.description
          }));
        this.statusOfLegalEntityList = response.statusOfLegalEntityList.items
          .filter((item: any) => item.description)
          .map((element: any) => ({
            ...element,
            formattedName: element.name ? `${element.name} - ${element.description}` : element.description
          }));
        this.sizeOfLegalEntityList = response.sizeOfLegalEntityList.items
          .filter((item: any) => item.description)
          .map((element: any) => ({
            ...element,
            formattedName: element.name ? `${element.name} - ${element.description}` : element.description
          }));
        this.typeOfPropertyList = response.typeOfPropertyList.items
          .filter((item: any) => item.description)
          .map((element: any) => ({
            ...element,
            formattedName: element.name ? `${element.name} - ${element.description}` : element.description
          }));
        this.naceCodeList = response.naceCodeList.items
          .filter((item: any) => item.description)
          .map((element: any) => ({
            ...element,
            formattedName: element.name ? `${element.name} - ${element.description}` : element.description
          }));
        this.crmIndCodeList = response.crmIndCodeList.items
          .filter((item: any) => item.description)
          .map((element: any) => ({
            ...element,
            formattedName: element.name ? `${element.name} - ${element.description}` : element.description
          }));
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
    this.formGroupInitialized = false;
    this.formGroup = new FormGroup({});
    this.isRegistrationProcess = this.getFormFieldValue('isRegistrationProcess');
    const residentClientLegalEntity = this.getFormFieldValue('resident');

    // Create controls
    this.formKeysLegalEntity.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    // Initialize controls with values (this is because some logic in control listeners must be triggered)
    // So this is the reason why creation and initialization are separated
    this.formKeysLegalEntity.forEach(formKey => {
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

    if (residentClientLegalEntity) {
      this.formGroup.controls['activityCode'].addValidators(Validators.required);
    }

    if (this.isRegistrationProcess) {
      this.formGroup.controls['alignmentWithApr'].setValue(true);
      this.formGroup.controls['codeOfBranchPredominantActivity'].disable();
      this.formGroup.controls['statusOfLegalEntity']
        .setValue(this.findItemByProperty(this.statusOfLegalEntityList, 'description', 'Redovan/aktivan'));
      this.formGroup.controls['statusOfLegalEntity'].disable();
    }

    this.formGroupInitialized = true;
    console.log('Form group: ', this.formGroup);
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



}
