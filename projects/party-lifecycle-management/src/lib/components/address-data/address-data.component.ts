import { ChangeDetectorRef, Component, DoCheck, Injector, OnInit, ViewChild } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AseeFormControl, BpmTasksHttpClient, ErrorEmitterService, FormField, LoaderService } from '@asseco/common-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { ActivatedRoute, Router } from '@angular/router';
import { ReferenceService } from '../../services/reference.service';
import { CustomService } from '../../services/custom.service';
import { catchError, combineLatest, forkJoin, of, tap } from 'rxjs';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { LocationService } from '../../services/location.service';
import { OfferService } from '../../services/offer.service';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'lib-address-data',
  standalone: true,
  imports: [AssecoMaterialModule, L10nTranslationModule, L10nIntlModule, MaterialModule,
    ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective, ReactiveFormsModule],
  templateUrl: './address-data.component.html',
  styleUrl: './address-data.component.scss'
})
export class AddressDataComponent implements OnInit, DoCheck {
  @ViewChild('country', { static: false }) countryAutocomplete!: any;
  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized = false;
  public form: FormGroup;
  public countryControlDisabled = false;
  public typeOfClientList: any = [];
  public countriesList: any = [];
  public placesList: any = [];
  public notResidentClient = false;
  public addressTypes: any = [];
  public submitDisable = true;
  public originalAutocompleteOptions: Array<MatOption> = [];
  protected router: Router;
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  public formKeys = [
    {
      key: 'typeOfAddress',
      validators: [
        Validators.required,
      ]
    },
    {
      key: 'country',
      validators: [
        Validators.required,
      ]
    },
    {
      key: 'placeName',
      validators: [
        Validators.required,
      ]
    },
    {
      key: 'streetName',
      validators: [Validators.required,]
    },
    {
      key: 'streetNumber',
      validators: [Validators.required,]
    },
    {
      key: 'entry',
      validators: []
    },
    {
      key: 'floorNumber',
      validators: []
    },
    {
      key: 'apartmentNumber',
      validators: []
    }
  ];

  // Store references and prefilled flags
  constructor(
    protected injector: Injector,
    protected errorEmitterService: ErrorEmitterService,
    protected offerService: OfferService,
    private locationService: LocationService,
    private referenceService: ReferenceService,
    private fb: FormBuilder,
    private customService: CustomService,
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
      typeOfClientList: this.customService.getClassification('JK2TIPKM'),
      addressTypes: this.offerService.getClassification('address-types'),
      countriesList: this.referenceService.getCountries(),
    }).pipe(
      tap(({ typeOfClientList, addressTypes, countriesList }) => {
        typeOfClientList.items.filter((item: any) => item.name).map((element: any) =>
          element.formattedName = element.description ? `${element.name} - ${element.description}` : element.name);
        this.typeOfClientList = typeOfClientList.items;
        addressTypes.values.filter((item: any) => item.name);
        this.addressTypes = addressTypes.values;
        this.countriesList = countriesList.items.filter((item: any) => item.name);
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

    const addressDataList = JSON.parse(this.getFormFieldValue('addressDataList'));
    if (!addressDataList) {
      this.initEmptyFormGroup();
      return;
    }

    addressDataList.forEach((id: any) => {
      const fg: FormGroup = new FormGroup({});
      this.formKeys.forEach(formKey => {
        if (formKey) {
          const control = new AseeFormControl(null, formKey.validators);
          fg.addControl(formKey.key, control);
          fg.controls[formKey.key].setValue(id[formKey.key]);
          fg.controls[formKey.key].updateValueAndValidity();
        }
      });
      this.updateValueAndValidateControls(fg);
    });

    this.filterAddressTypes();

    this.formGroupInitialized = true;

  }

  private initEmptyFormGroup() {
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

    this.updateValueAndValidateControls(this.formGroup);
    this.formGroupInitialized = true;

  }

  private updateValueAndValidateControls(fg: FormGroup) {
    if (this.getFormFieldValue('isLegalEntity')) {
      this.addressTypes = this.addressTypes.filter((element: any) => element?.literal !== 'work');
    }

    if (!this.getFormFieldValue('notResident')) {
      fg.controls['country']?.setValue(this.findItemByProperty(this.countriesList, 'name', 'REPUBLIKA SRBIJA'));
    };


    fg.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        // Update the submitDisable flag based on the presence of a 'legal' address
        this.submitDisable = !this.groups.controls.some(group =>
          group.controls['typeOfAddress']?.value?.literal === 'legal'
        );
      }
    });


    fg.controls['typeOfAddress'].valueChanges.subscribe((newValue: any) => {
      if (newValue?.literal === 'legal' && this.getFormFieldValue('countryOfficialAddress')) {
        const parsedValue = JSON.parse(this.getFormFieldValue('countryOfficialAddress'));
        console.log(JSON.parse(this.getFormFieldValue('countryOfficialAddress')));
        this.prefillAutocompleteField(this.countryAutocomplete, 'country', parsedValue);
        this.countryControlDisabled = true;
      } else {
        this.countryControlDisabled = false;
      }
    });


    fg.controls['placeName'].valueChanges.subscribe((newValue: any) => {
      this.locationService.getPlacesByPlaceQuery(newValue).subscribe(placesList => {
        placesList.items.filter((item: any) => item.name).map((element: any) =>
          element.formattedName = element.administrativeDivision ?
            `${element.name} - ${element.placeCode} - ${element.administrativeDivision}` : `${element.name} - ${element.placeCode}`);
        this.placesList = placesList.items;
      });

    });

    fg.markAllAsTouched();
    this.groups.push(fg);
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
    this.filterAddressTypes();
  }

  private filterAddressTypes() {
    const singleUseAddresses = this.addressTypes.filter((address: any) =>
      address.additionalFields.single === 'true'
    );

    // remove already used single address from dropdown
    this.groups.controls.forEach(element => {
      const matchingAddress = singleUseAddresses.find((a: any) => element.controls['typeOfAddress'].value?.literal === a.literal);
      if (matchingAddress) {
        this.addressTypes = this.addressTypes.filter((item: any) => item.literal !== matchingAddress.literal);
      }
    });
  }

  public removeGroup() {
    const removedAddress = this.groups.controls.pop();

    if (!removedAddress) { return; }

    const { value: removedAddressType } = removedAddress.controls['typeOfAddress'] || {};
    const removedLiteral = removedAddressType?.literal;

    if (removedLiteral) {
      const existingType = this.addressTypes.find((a: any) => a.literal === removedLiteral);

      // Add the removed address type to the list if it doesn't exist
      if (!existingType) {
        this.addressTypes.push(removedAddressType);
      }
    }

    // Update the submitDisable flag based on the presence of a 'legal' address
    this.submitDisable = !this.groups.controls.some(group =>
      group.controls['typeOfAddress']?.value?.literal === 'legal'
    );
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

  public onSubmit() {
    this.formGroup = new FormGroup({});
    this.modifyControlsBeforeSubmit();
    this.formGroup.addControl('addressDataList', new AseeFormControl(this.groups.value));
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

  private prefillAutocompleteField(viewChild: any, controlName: any, controlValue: any) {
    const selMatOption = this.originalAutocompleteOptions?.find((o: any) => JSON.stringify(o.value) === JSON.stringify(controlValue));
    // If option found
    if (selMatOption) {
      // Select autocomplete option
      selMatOption?.select();

      // Set view child internal control
      viewChild.controlInternal.setValue(controlValue);
      viewChild.controlInternal.updateValueAndValidity({ emitEvent: true });
      viewChild.optionSelected.emit(controlValue);

      // Set form control
      this.formGroup.controls[controlName].setValue(controlValue);
      this.formGroup.controls[controlName].updateValueAndValidity({ emitEvent: true });
    }
  }

  ngDoCheck() {
    if (this.countryAutocomplete && this.originalAutocompleteOptions.length === 0) {
      this.originalAutocompleteOptions = this.countryAutocomplete.autocomplete.options.toArray();
    }
  }

}
