import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, ConfigurationHttpClient, ErrorEmitterService, FormField, LoaderService }
  from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { catchError, combineLatest, forkJoin, of, tap } from 'rxjs';
import { OfferService } from '../../services/offer.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'lib-contact-data',
  standalone: true,
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule,
    ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective, ReactiveFormsModule],
  templateUrl: './contact-data.component.html',
  styleUrl: './contact-data.component.scss'
})
export class ContactDataComponent implements OnInit {
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  protected router: Router;
  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized = false;
  public form: FormGroup;
  public contactTypes: any = [];
  public submitDisable = false;
  public showPhoneNumberField = false;
  public showSwiftField = false;
  public showMailField = false;
  public basisForClientRegistration = '';
  public phoneAreaCodes = [];
  public operatorNumbers = [];
  public isLegalEntity = false;
  public isRegistrationProcess = true;
  public formKeys = [
    {
      key: 'typeOfContact',
      validators: [Validators.required]
    },
  ];

  // Store references and prefilled flags
  constructor(
    protected injector: Injector,
    protected errorEmitterService: ErrorEmitterService,
    protected offerService: OfferService,
    protected configurationService: ConfigurationHttpClient,
    private fb: FormBuilder,
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
    this.router = this.injector.get(Router);
    this.form = this.fb.group({
      groups: this.fb.array([])  // Initialize FormArray to hold groups
    });
  }

  ngOnInit(): void {
    // Combine multiple HTTP requests using forkJoin
    forkJoin({
      contactTypes: this.offerService.getClassification('contact-types'),
      phoneAreaCodes: this.configurationService.getEffective('party-lcm/phone-area-codes').build(),
      operatorNumbers: this.configurationService.getEffective('party-lcm/operator-numbers').build(),
    }).pipe(
      tap(({ contactTypes, phoneAreaCodes, operatorNumbers }) => {
        contactTypes.values.filter((item: any) => item.name);
        this.contactTypes = contactTypes.values;
        this.phoneAreaCodes = phoneAreaCodes?.split(',');
        this.operatorNumbers = operatorNumbers?.split(',').map((str: any) => parseInt(str, 10).toString());
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
    this.formGroupInitialized = false;

    const contactDataList = JSON.parse(this.getFormFieldValue('contactDataList'));
    if (!contactDataList) {
      this.initEmptyFormGroup();
      return;
    }

    contactDataList.forEach((id: any) => {
      const fg: FormGroup = new FormGroup({});
      this.formKeys.forEach(formKey => {
        if (formKey) {
          const control = new AseeFormControl(null, formKey.validators);
          fg.addControl(formKey.key, control);
          fg.controls[formKey.key].setValue(id[formKey.key]);
          fg.controls[formKey.key].updateValueAndValidity();
        }
      });
      this.updateValueAndValidateControls(fg, id);
    });

    this.filterContactTypes();

    this.formGroupInitialized = true;

  }

  private initEmptyFormGroup() {
    this.basisForClientRegistration = this.getFormFieldValue('basisForClientRegistration');
    this.isRegistrationProcess = this.getFormFieldValue('isRegistrationProcess');
    this.formGroup = new FormGroup({});
    // Create controls
    this.formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

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


    this.updateValueAndValidateControls(this.formGroup, null);
    this.formGroupInitialized = true;

  }

  private updateValueAndValidateControls(fg: FormGroup, contactPoint: any) {

    this.isLegalEntity = this.getFormFieldValue('isLegalEntity');
    this.isRegistrationProcess = this.getFormFieldValue('isRegistrationProcess');

    fg.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        this.logicToEnsureRequredContactsAreAdded();
      }
    });

    fg.addControl('showPhoneNumberField', new AseeFormControl(false));
    fg.addControl('showSwiftField', new AseeFormControl(false));
    fg.addControl('showMailField', new AseeFormControl(false));
    fg.addControl('phoneNumber', new AseeFormControl(null));

    // Prefill data if it is not registration process
    if (contactPoint != null && !this.isRegistrationProcess) {
      this.prefillData(fg, contactPoint);
    }

    fg.controls['typeOfContact'].valueChanges.subscribe((newValue: any) => {
      fg.controls['showPhoneNumberField'].setValue(newValue?.additionalFields.kind === 'telecommunication-number');

      if (fg.controls['showPhoneNumberField'].value) {

        if (newValue.literal === 'legal-mobile-phone-number' || newValue.literal === 'other-mobile-phone-numbers') {
          if (!fg.controls['phoneNumber'].value) {
            fg.controls['phoneNumber'].setValue('+381');
          }
          fg.controls['phoneNumber'].clearValidators();
          const regex = new RegExp(`^\\+381(${this.operatorNumbers.join('|')})\\d{6,7}$`);
          fg.controls['phoneNumber'].addValidators([Validators.required, Validators.pattern(regex)]);
          fg.controls['phoneNumber'].updateValueAndValidity();
        }

        if (newValue.literal === 'home-phone-number' || newValue.literal === 'work-phone-number') {
          fg.controls['phoneNumber'].clearValidators();
          const regex = new RegExp(`^(${this.phoneAreaCodes.join('|')}).{5,}$`);
          fg.controls['phoneNumber'].addValidators([Validators.required, Validators.pattern(regex)]);
          fg.controls['phoneNumber'].updateValueAndValidity();
        }
      }

      fg.controls['showSwiftField'].setValue(newValue?.additionalFields.method === 'swift');

      if (fg.controls['showSwiftField'].value) {
        fg.addControl('swiftContact', new AseeFormControl(null, [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]));
        fg.controls['phoneNumber'].updateValueAndValidity();
      }

      fg.controls['showMailField'].setValue(newValue?.additionalFields.method === 'email');

      if (fg.controls['showMailField'].value) {
        fg.addControl('email', new AseeFormControl(null, [Validators.required, Validators.email]));
        fg.controls['phoneNumber'].updateValueAndValidity();
      }
    });

    fg.controls['phoneNumber']?.valueChanges.subscribe((newValue: any) => {
      if (fg.controls['typeOfContact'].value.literal === 'other-mobile-phone-numbers') {
        if (!newValue.startsWith('+381')) {
          fg.controls['phoneNumber'].clearValidators();
          fg.controls['phoneNumber'].addValidators([Validators.required, Validators.pattern(/^\+[0-9]{9,10}$/)]);
        }
      }

    });

    fg.markAllAsTouched();
    this.groups.push(fg);
  }

  public logicToEnsureRequredContactsAreAdded() {
    // Update the submitDisable flag based on the presence of a certain contact type
    if (!this.isLegalEntity) {
      this.submitDisable = !this.groups.controls.some(group =>
        group.controls['typeOfContact']?.value?.literal === 'legal-mobile-phone-number'
      );
    }

    if (this.isLegalEntity && this.basisForClientRegistration !== null && this.basisForClientRegistration.toUpperCase() !== 'KLIJENT') {
      this.submitDisable = !this.groups.controls.some(group =>
        group.controls['typeOfContact']?.value?.literal === 'legal-mobile-phone-number'
      );
    }

    if (this.isRegistrationProcess && this.basisForClientRegistration.toUpperCase() !== 'KLIJENT') {
      this.submitDisable = !this.groups.controls.some(group =>
        group.controls['typeOfContact']?.value?.literal === 'other-mail-address'
      );
    }

    if (this.isRegistrationProcess) {
      this.submitDisable = !this.groups.controls.some(group =>
        group.controls['typeOfContact']?.value?.literal === 'legal-mail-address'
      );
    }

  }

  private prefillData(fg: any, contactPoint: any) {
    const typeOfContactLiteral = contactPoint.typeOfContact;
    const typeOfContact = this.contactTypes.find((type: any) => type.literal === typeOfContactLiteral);

    if (typeOfContact) {
      fg.controls.typeOfContact.setValue(typeOfContact);
    }

    if (contactPoint.showPhoneNumberField) {
      fg.addControl('phoneNumber', new AseeFormControl(null));
      fg.controls.phoneNumber.setValue(contactPoint.phoneNumber);
    }

    if (contactPoint.showMailField) {
      fg.addControl('email', new AseeFormControl(null));
      fg.controls.email.setValue(contactPoint.email);

    }

    if (contactPoint.showSwiftField) {
      fg.addControl('swiftContact', new AseeFormControl(null));
      fg.controls.swiftContact.setValue(contactPoint.swiftContact);

    }
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

  get groups(): FormArray<FormGroup> {
    return this.form.get('groups') as FormArray;
  }

  public addGroup() {
    this.initEmptyFormGroup();
    this.filterContactTypes();
  }

  private filterContactTypes() {
    const singleUseContacts = this.contactTypes.filter((contact: any) =>
      contact.additionalFields.single === 'true'
    );

    // remove already used single contact from dropdown
    this.groups.controls.forEach(element => {
      const matchingContact = singleUseContacts.find((a: any) => element.controls['typeOfContact'].value?.literal === a.literal);
      if (matchingContact) {
        this.contactTypes = this.contactTypes.filter((item: any) => item.literal !== matchingContact.literal);
      }
    });
  }

  public removeGroup(index: any) {
    const removedContact = this.groups.controls[index];
    this.groups.removeAt(index);

    if (!removedContact) { return; }

    const { value: removedContactType } = removedContact.controls['typeOfContact'] || {};
    const removedLiteral = removedContactType?.literal;

    if (removedLiteral) {
      const existingType = this.contactTypes.find((a: any) => a.literal === removedLiteral);

      // Add the removed contact type to the list if it doesn't exist
      if (!existingType) {
        this.contactTypes.push(removedContactType);
      }
    }

    this.logicToEnsureRequredContactsAreAdded();

  }

  public onSubmit() {
    this.formGroup = new FormGroup({});
    this.modifyControlsBeforeSubmit();
    // remove unnecessary controls
    this.groups.controls.forEach(formGroup => {
      formGroup.removeControl('showPhoneNumberField');
      formGroup.removeControl('showSwiftField');
      formGroup.removeControl('showMailField');
    });
    this.formGroup.addControl('contactDataList', new AseeFormControl(this.groups.value));
    this.bpmTaskService.complete(this.task.id, this.formGroup)
      .build().subscribe((res) => {
        this.router.navigateByUrl('tasks');
      },
        (err) => {
          this.errorEmitterService.setError(err);
        }
      );
  }

  public modifyControlsBeforeSubmit() {
    // Go through each date and subtract time zone (sending one date before current problem)
    this.groups.controls.forEach((formGroup: any) => {
      Object.keys(formGroup.controls).forEach((key) => {
        const control = formGroup.get(key);
        if ((typeof control.value) === 'string') {
          control.value = control.value.toUpperCase();
          control.updateValueAndValidity();
        }

        if (control.value instanceof Date) {
          const options = { timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit' };
          const belgradeDateString = control.value.toLocaleDateString('en-CA', options); // 'en-CA' outputs in YYYY-MM-DD format
          control.value = belgradeDateString;
          control.updateValueAndValidity();
        }
      });
    });

  }

}
