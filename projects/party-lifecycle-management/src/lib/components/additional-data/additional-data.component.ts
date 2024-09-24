/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, ConfigurationHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { combineLatest, forkJoin, tap } from 'rxjs';
import { CustomService } from '../../services/custom.service';
import { ReferenceService } from '../../services/reference.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'additional-data',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective],
  templateUrl: './additional-data.component.html',
  styleUrl: './additional-data.component.scss'
})
export class AdditionalDataComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroupInitialized = false;
  public isIndividualEntity = false;
  public isRegistrationProcess = false;
  public isTest = false;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public treatmentOfClientInterestList: any = [];
  public accountManagerList: any = [];
  public sectoralDivisionUSSPOList: any = [];
  public marketingConsentList: any = [];
  public maxDate = new Date();
  public datePickerFlags: any = { treatmentDateValidFrom: true, tarrifDateValidFrom: true };
  public defaultData = null;
  public formKeys = [
    { key: 'treatmentOfClientInterest', validators: [Validators.required] },
    { key: 'treatmentDateValidFrom', validators: [Validators.required] },
    { key: 'tariffGroupOfClientCommissions', validators: [Validators.required] },
    { key: 'tarrifDateValidFrom', validators: [Validators.required] },
    { key: 'accountManager', validators: [] },
    { key: 'backupAccountManager', validators: [] },
    { key: 'classificationAccordingToNBS', validators: [] },
    { key: 'note', validators: [] },
    { key: 'sectoralDivisionUSSPO', validators: [] },
    { key: 'riskLevel', validators: [] },
    { key: 'dateOfRiskLevel', validators: [] },
    { key: 'dateOfNextRiskLevel', validators: [] },
    { key: 'basisForClientRegistration', validators: [] },
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;


  constructor(protected injector: Injector,
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
      treatmentOfClientInterestCategories: this.customService.getClassification('TRETMANK'),
      accountManagerCategories: this.customService.getClassification('ACC_MNG'),
      sectoralDivisionUSSPOCategories: this.customService.getClassification('KS3USEK'),
      marketingConsentListCategories: this.customService.getClassification('SAGMARK'),
      currencies: this.referenceService.getCurrencies(),
      defaultData: this.configurationService.getEffective('party-lcm/treatment-and-additional-attributes-default-data').build()

    }).pipe(
      tap(({
        treatmentOfClientInterestCategories,
        accountManagerCategories,
        sectoralDivisionUSSPOCategories,
        marketingConsentListCategories,
        defaultData }) => {

        treatmentOfClientInterestCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        accountManagerCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        sectoralDivisionUSSPOCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        marketingConsentListCategories.items.map((element: any) =>
          element.formattedName = `${element.description} - ${element.name}`
        );

        this.treatmentOfClientInterestList = treatmentOfClientInterestCategories.items;
        this.accountManagerList = accountManagerCategories.items;
        this.sectoralDivisionUSSPOList = sectoralDivisionUSSPOCategories.items;
        this.marketingConsentList = marketingConsentListCategories.items;
        this.defaultData = JSON.parse(defaultData);

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
        this.initFormGroup();
      });
    });
  }

  private initFormGroup() {
    this.formGroupInitialized = false;
    this.isIndividualEntity = this.getFormFieldValue('isIndividualEntity');
    this.isRegistrationProcess = this.getFormFieldValue('isRegistrationProcess');
    this.isTest = this.getFormFieldValue('isTest');
    this.formGroup = new FormGroup({});

    // Create controls
    this.formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    this.formGroup.controls['treatmentOfClientInterest'].valueChanges.subscribe(treatment => {
      this.formGroup.controls['treatmentDateValidFrom'].setValue(new Date());
    });

    this.formGroup.controls['tariffGroupOfClientCommissions'].valueChanges.subscribe(tarrif => {
      this.formGroup.controls['tarrifDateValidFrom'].setValue(new Date());
    });

    this.formGroup.controls['basisForClientRegistration'].valueChanges.subscribe(basis => {
      if (basis === 'klijent') {
        this.formGroup.controls['accountManager'].addValidators(Validators.required);
      }
    });

    // Initialize controls with values (this is because some logic in control listeners must be triggered)
    // So this is the reason why creation and initialization are separated
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


    if (this.isIndividualEntity) {
      const control = new AseeFormControl(this.getFormFieldValue('marketingConsent'), []);
      this.formGroup.addControl('marketingConsent', control);
    }

    if (this.isRegistrationProcess) {
      this.formGroup.controls['treatmentDateValidFrom'].setValue(new Date());
      this.formGroup.controls['tarrifDateValidFrom'].setValue(new Date());
      this.setDefaultData();
    }

    console.log(this.formGroup);
    // this.formGroup.markAllAsTouched();
    this.formGroupInitialized = true;
  }

  private setDefaultData() {
    // Check if it's the registration process and if defaultData exists
    if (this.defaultData) {

      // Combine 'individual' and 'legal' data from defaultData, and filter only unique values
      const treatmentsToFind = [
        ...Object.values(this.defaultData['individual']),
        ...Object.values(this.defaultData['legal'])
      ].filter(this.onlyUnique);

      // Initialize an object to store matched treatments by their name
      const treatmentsByName: { [key: string]: any } = {};

      // Iterate over each treatment name to find a matching treatment from treatmentOfClientInterestList
      treatmentsToFind.forEach((treatmentName: any) => {
        const matchingTreatment = this.treatmentOfClientInterestList.find(
          (treatment: any) => treatment['name'] === treatmentName
        );
        // If a match is found, store it in treatmentsByName object
        if (matchingTreatment) {
          treatmentsByName[treatmentName] = matchingTreatment;
        }
      });

      // If the entity is an individual, set form controls with corresponding 'individual' data
      if (this.isIndividualEntity && this.defaultData['individual']) {
        this.formGroup.controls['tariffGroupOfClientCommissions'].setValue(
          this.defaultData['individual']['tariffGroupOfClientCommissions']
        );
        this.formGroup.controls['treatmentOfClientInterest'].setValue(
          this.defaultData['individual']['treatmentOfClientInterest']
        );
      }
      // If the entity is legal, set form controls with corresponding 'legal' data
      else if (!this.isIndividualEntity && this.defaultData['legal']) {
        this.formGroup.controls['tariffGroupOfClientCommissions'].setValue(
          this.defaultData['legal']['tariffGroupOfClientCommissions']
        );
        this.formGroup.controls['treatmentOfClientInterest'].setValue(
          this.defaultData['legal']['treatmentOfClientInterest']
        );
      }
    }
  }



  private onlyUnique(value: any, index: any, array: any) {
    return array.indexOf(value) === index;
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

  public clearDateOnEmptyInput(formControlName: string) {
    const hasErrors = this.formGroup.controls[formControlName].errors !== null;
    let hasParseErrors = false;
    let isEmptyText = false;

    const errors = this.formGroup.controls[formControlName].errors;

    if (errors?.['matDatepickerParse']) {
      hasParseErrors = errors['matDatepickerParse'];
      isEmptyText = errors['matDatepickerParse'].text === '';
    }
    // Clear control only when:
    if (hasErrors && hasParseErrors && isEmptyText) {
      this.datePickerFlags[formControlName] = false;
      this.formGroup.controls[formControlName].setValue(null);
      this.formGroup.controls[formControlName].updateValueAndValidity();

      setTimeout(() => {
        this.datePickerFlags[formControlName] = true;
      }, 0);
    }
  }

  // Method to mark control as touched
  markAsTouched(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

}
