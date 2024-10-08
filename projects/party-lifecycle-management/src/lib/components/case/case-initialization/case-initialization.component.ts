import { ChangeDetectorRef, Component, DoCheck, Injector, OnInit, ViewChild, inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AseeFormControl, FormField, UIService, UserService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialAutocompleteComponent, MaterialDatepickerComponent, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule, L10nTranslationService } from 'angular-l10n';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { OfferService } from '../../../services/offer.service';
import { PartyLcmService } from '../../../services/party-lcm.service';
import { PartyService } from '../../../services/party.service';
import { MaterialCustomerActionsComponent } from '../../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../../utils/error-handling/error-handling.component';
import { PartySelectionComponent } from './party-selection/party-selection.component';
import { CustomValidatorsService } from '../../../services/custom-validators.service';

@Component({
  selector: 'party-lcm-case-initialization',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective],
  templateUrl: './case-initialization.component.html',
  styleUrl: './case-initialization.component.scss'
})
export class CaseInitializationComponent implements OnInit, DoCheck {
  readonly dialog = inject(MatDialog);
  private agent: any;
  private snackBar = inject(MatSnackBar);
  private caseId = '';
  private bapoTypeOfIdentificationDocument: any = null;
  private bapoIdentificationDocumentNumber: any = null;
  private bapoRegistrationProfile: any = null;
  private bapoClientKind: any = null;
  private bapoBranchIdentifier: any = null;
  private agentHasRegistrationRole = false;
  private agentHasDataUpdateRole = false;
  private agentHasAmlRole = false;
  private initialSearch = false;
  public readonlyRP = false;
  public basisOptions = [{}];
  public selectedUser: any;
  public formGroupInitialized = false;
  public locale: L10nLocale;
  public previousValue = null;
  public typeOfClientList: any = [{ name: 'FL' }, { name: 'PL' }];
  public individualPersonOptionsList: any = [];
  public legalPersonOptionsList: any = [];
  public processSelectionList: any = [];
  public initialProcessSelectionList: any = [];
  public formFields: FormField[] = [];
  public formGroup: FormGroup = new FormGroup({});
  public maxDate = new Date();
  @ViewChild('basisOfReg', { static: false })
  public basisOfReg: MaterialAutocompleteComponent | undefined;
  @ViewChild('clientDateOfBirthPicker', { static: false })
  public dateOfBirth: MaterialDatepickerComponent | undefined;
  public formKeysIndividualPerson = [
    {
      key: 'jmbg',
      validators: []
    },
    {
      key: 'registrationNumber',
      validators: []
    },
    {
      key: 'passportNumber',
      validators: []
    },
    {
      key: 'customerName',
      validators: []
    },
    {
      key: 'dateOfBirth',
      validators: []
    },
    {
      key: 'clientId',
      validators: []
    },
    {
      key: 'registrationProfile',
      validators: [Validators.required]
    },
    {
      key: 'selectedProcess',
      validators: []
    }
  ];
  public formKeysLegalEntity = [
    {
      key: 'mbrNumber',
      validators: []
    },
    {
      key: 'organizationNumber',
      validators: []
    },
    {
      key: 'pib',
      validators: []
    }, ,
    {
      key: 'nameOfPl',
      validators: []
    },
    {
      key: 'clientId',
      validators: []
    },
    {
      key: 'registrationProfile',
      validators: [Validators.required]
    },
    {
      key: 'selectedProcess',
      validators: [Validators.required]
    }
  ];
  public isIndividualPerson = false;

  constructor(protected injector: Injector,
              private uiService: UIService,
              private offerService: OfferService,
              private partyService: PartyService,
              private partyLcmService: PartyLcmService,
              private userService: UserService,
              protected translationService: L10nTranslationService,
              private router: Router,
              private route: ActivatedRoute,
              protected cdr: ChangeDetectorRef
  ) {
    this.locale = injector.get(L10N_LOCALE);
    this.uiService.setTitle('Case initialization');
    this.agent = this.userService.getUserData();
    this.agentHasRegistrationRole = this.agent.roles.some((item: string) => item.includes('DO_Agent_Maticenje'));
    this.agentHasDataUpdateRole = this.agent.roles.some((item: string) => item.includes('DO_Agent_Azuriranje'));
    this.agentHasAmlRole = this.agent.roles.some((item: string) => item.includes('DO_AML'));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.bapoClientKind = params['kind'] || null;
      this.bapoTypeOfIdentificationDocument = params['id-kind'] || null;
      this.bapoIdentificationDocumentNumber = params['id-number'] || null;
      this.bapoRegistrationProfile = params['registration-profile'] || null;
      this.bapoBranchIdentifier = params['branch-identifier'] || null;



    });
    // Combine multiple HTTP requests using forkJoin
    forkJoin({
      individualPersonOptions: this.offerService.getClassification('individual-person-options'),
      legalPersonOptions: this.offerService.getClassification('legal-person-options'),
      basis: this.partyService.getRegistrationProfiles(),
      processOptions: this.offerService.getClassification('agent-process-choose')
    }).pipe(
      tap(({ individualPersonOptions, legalPersonOptions, basis, processOptions }) => {
        this.individualPersonOptionsList = individualPersonOptions.values;
        this.legalPersonOptionsList = legalPersonOptions.values;
        this.basisOptions = basis.values.filter((item: any) => item.literal);
        this.processSelectionList = processOptions.values;

        if (!this.agentHasAmlRole) {
          this.processSelectionList = this.removeByProperty(this.processSelectionList, 'literal', 'recalculation-of-risk-level');
        }

        this.initialProcessSelectionList = processOptions.values;

        this.initFormGroup(true);
      }),
      catchError(error => {
        console.error('Error fetching data:', error);
        return of(null); // Handle the error and return a fallback value if needed
      })
    ).subscribe();
  }

  ngDoCheck(): void {
    if (this.formGroup.controls['typeOfClient']
      && this.formGroup.controls['typeOfClient'].value
      && this.previousValue !== this.formGroup.controls['typeOfClient'].value) {
      this.previousValue = this.formGroup.controls['typeOfClient'].value;
      this.initFormGroup(false);
      this.bapoTypeOfIdentificationDocument = null;
      this.bapoIdentificationDocumentNumber = null;
      this.bapoClientKind = null;
      this.bapoRegistrationProfile = null;
      this.bapoBranchIdentifier = null;
      this.selectedUser = null;
      this.setRegistrationProfile();
    }
    if (this.selectedUser != null) {
      this.formGroup.controls['selectedProcess'].addValidators(Validators.required);
      this.formGroup.controls['selectedProcess'].updateValueAndValidity();
      this.formGroup.controls['selectedProcess'].markAsTouched();
    } else {
      if (this.formGroup.controls['selectedProcess']) {
        this.formGroup.controls['selectedProcess'].clearValidators();
        this.formGroup.controls['selectedProcess'].updateValueAndValidity();
        this.formGroup.controls['selectedProcess'].markAsTouched();
      }
    }

    if(document.getElementById('searchButton') && this.initialSearch){
      this.initialSearch = false;
      document.getElementById('searchButton')?.click();
    }
  }

  private initFormGroup(isInitial: boolean = false) {
    this.formGroupInitialized = false;
    let typeOfClientControl = new AseeFormControl(JSON.parse(this.getFormFieldValue('typeOfClient')), Validators.required) as any;
    let identificationDocumentsControl = new AseeFormControl(
      JSON.parse(this.getFormFieldValue('identificationDocuments') ?? null),
      CustomValidatorsService.checkUndefined()
    ) as any;

    // If init form group is not initial call then restore previous type of client
    if (!isInitial) {
      typeOfClientControl = this.formGroup.controls['typeOfClient'];
      identificationDocumentsControl = this.formGroup.controls['identificationDocuments'];
    }

    // Initialize empty form
    this.formGroup = new FormGroup({});

    this.formGroup.addControl('typeOfClient', typeOfClientControl);
    this.formGroup.addControl('identificationDocuments', identificationDocumentsControl);


    let formKeys = this.formGroup.controls['typeOfClient'].value
      && this.formGroup.controls['typeOfClient'].value.name === 'PL' ? this.formKeysLegalEntity : this.formKeysIndividualPerson;
    this.isIndividualPerson = this.formGroup.controls['typeOfClient'].value
      && this.formGroup.controls['typeOfClient'].value.name === 'PL' ? false : true;

    if (isInitial && this.bapoClientKind) {
      this.isIndividualPerson = this.bapoClientKind === 'individual' ? true : false;
      formKeys = this.bapoClientKind === 'individual' ? this.formKeysIndividualPerson : this.formKeysLegalEntity;
    }

    // Create controls
    formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
        this.formGroup.controls[formKey.key].updateValueAndValidity();
      }
    });

    this.formGroup.controls['registrationProfile'].valueChanges.subscribe(newValue => {
      this.formGroup.controls['selectedProcess'].setValue(null);
      this.formGroup.controls['selectedProcess'].updateValueAndValidity();
      this.formGroup.controls['selectedProcess'].markAsTouched();
      if (newValue && newValue.literal) {
        if (newValue.literal === 'customer' || newValue.literal === 'counter-party') {
          this.processSelectionList = this.initialProcessSelectionList;
        }
      } else {
        this.processSelectionList = this.removeByProperty(this.processSelectionList, 'literal', 'kyc-renewal');
        this.processSelectionList = this.removeByProperty(this.processSelectionList, 'literal', 'recalculation-of-risk-level');
      }
    });

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

    if (this.bapoClientKind) {
      const val = this.findItemByProperty(this.typeOfClientList, 'name', this.bapoClientKind === 'individual' ? 'FL' : 'PL');
      this.formGroup.controls['typeOfClient']?.setValue(val);
      this.previousValue = val;

    }

    if (this.bapoRegistrationProfile) {
      this.setRegistrationProfile(this.bapoRegistrationProfile);
    }

    if (this.bapoTypeOfIdentificationDocument) {
      const documentMap = {
        'personal-id-number': { formControl: 'jmbg', literal: 'jmbg' },
        'identity-card-number': { formControl: 'registrationNumber', literal: 'broj-lk' },
        'passport-number': { formControl: 'passportNumber', literal: 'broj-pasosa' },
        id: { formControl: 'clientId', literal: 'id-komitenta' },
        'registration-number': { formControl: 'mbrNumber', literal: 'mbr-org' },
        'tax-id-number': { formControl: 'pib', literal: 'pib' }
      } as const;
      const documentKey = this.bapoTypeOfIdentificationDocument as keyof typeof documentMap;
      const documentValue = documentMap[documentKey];

      this.formGroup.controls['identificationDocuments']?.setValue(
        this.findItemByProperty(this.isIndividualPerson ?
          this.individualPersonOptionsList : this.legalPersonOptionsList, 'literal', documentValue.literal));
      if (this.bapoIdentificationDocumentNumber) {
        this.formGroup.controls[documentValue.formControl]?.setValue(this.bapoIdentificationDocumentNumber);
      }
      if (documentValue.formControl === 'mbrNumber' && this.bapoBranchIdentifier) {
        this.formGroup.controls['organizationNumber']?.setValue(this.bapoBranchIdentifier);
      }
    }

    if (!isInitial) {
      this.formGroup.markAllAsTouched();
    }

    this.formGroupInitialized = true;

    if(this.bapoClientKind && this.bapoTypeOfIdentificationDocument && this.bapoIdentificationDocumentNumber && isInitial){
      this.initialSearch = true;
    }

    console.log('Form group: ', this.formGroup);
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

  private removeByProperty(array: [], property: string, value: string) {
    return array.filter(item => item[property] !== value);
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

  openDialog(data: any) {
    const formattedData = data.map((item: any) => {
      if (item.birthDate) {  // Check if birthDate exists
        const [year, month, day] = item.birthDate.substring(0, 10).split('-');
        return {
          ...item,
          birthDate: `${day}-${month}-${year}` // Reformat to 'DD-MM-YYYY'
        };
      } else if (item.established) {
        const [year, month, day] = item.established.substring(0, 10).split('-');
        return {
          ...item,
          established: `${day}-${month}-${year}` // Reformat to 'DD-MM-YYYY'
        };
      } else {
        return item; // Return the object unchanged if birthDate is not present
      }
    });
    const dialogRef = this.dialog.open(PartySelectionComponent, {
      data:
        { parties: formattedData, isIndividualPerson: this.isIndividualPerson }, disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedUser = result;
        if(result.registrationProfile){
          const val = result.registrationProfile;
          this.setRegistrationProfile(val);
        }
      }
    });
  }

  removeSelectedUser() {
    this.selectedUser = null;
    this.setRegistrationProfile();
  }

  createRequest(selectedIdentificationDocument: string) {
    const isRegistrationProcess = this.selectedUser && this.selectedUser.partyNumber ? false : true;
    const selectedProcess = this.formGroup.controls['selectedProcess'] &&
    this.formGroup.controls['selectedProcess'].value ? this.formGroup.controls['selectedProcess'].value.literal : null;
    let caseType = '';
    if (!isRegistrationProcess && !this.agentHasDataUpdateRole) {
      this.openSnackBar('Nemate rolu za ažuriranje podataka klijenta', 'OK');
      return;
    }
    if (isRegistrationProcess && !this.agentHasRegistrationRole) {
      this.openSnackBar('Nemate rolu za matičenje klijenta', 'OK');
      return;
    }

    if (this.selectedUser == null) {
      caseType = this.isIndividualPerson
        ? 'individual-onboarding'
        : 'organization-onboarding';
    } else if (selectedProcess != null) {
      switch (selectedProcess) {
        case 'data-update':
          caseType = this.isIndividualPerson
            ? 'individual-update'
            : 'organization-update';
          break;
        case 'kyc-renewal':
          caseType = this.isIndividualPerson
            ? 'individual-kyc-renew'
            : 'organization-kyc-renew';
          break;
        case 'recalculation-of-risk-level':
          caseType = this.isIndividualPerson
            ? 'individual-risk-assessment-renew'
            : 'organization-risk-assessment-renew';
          break;
        default:
          break;
      }
    }

    let selectedDocumentNumber = null;
    let selectedDocumentKind = null;


    if (selectedIdentificationDocument) {
      const documentMap = {
        jmbg: { formControl: 'jmbg', kind: 'personal-id-number' },
        'broj-lk': { formControl: 'registrationNumber', kind: 'identity-card-number' },
        'broj-pasosa': { formControl: 'passportNumber', kind: 'passport-number' },
        'id-komitenta': { formControl: 'clientId', kind: 'id' },
        'mbr-org': { formControl: 'mbrNumber', kind: 'registration-number' },
        pib: { formControl: 'pib', kind: 'tax-id-number' }
      } as const;
      const documentKey = selectedIdentificationDocument as keyof typeof documentMap;
      const documentValue = documentMap[documentKey];
      selectedDocumentKind = documentValue.kind;
      selectedDocumentNumber = this.formGroup.controls[documentValue.formControl].value;
      if (documentValue.formControl === 'mbrNumber' && this.formGroup.controls['organizationNumber'].value) {
        selectedDocumentNumber += '|' + this.formGroup.controls['organizationNumber'].value;
      }
    }

    const payload = {
      type: caseType,
      'party-reference': {
        'party-number': this.selectedUser && this.selectedUser.partyNumber ? this.selectedUser.partyNumber : null,
        'party-name': this.selectedUser && this.selectedUser.contactName ? this.selectedUser.contactName : null,
        'party-kind': this.selectedUser && this.selectedUser.kind ?
          this.selectedUser.kind : this.isIndividualPerson ? 'individual' : 'organization',
        'party-identification-number': this.selectedUser
          && this.selectedUser.primaryId.number ? this.selectedUser.primaryId.number :
          selectedDocumentNumber ? selectedDocumentNumber : null,
        'party-identification-kind': this.selectedUser
          && this.selectedUser.primaryId.number ? this.selectedUser.primaryId.kind :
          selectedDocumentKind ? selectedDocumentKind : null
      },
      priority: 'high',
      'extension-data': {
        'registration-profile': this.formGroup.controls['registrationProfile'].value?.literal
      },
      channel: this.getChannel(),
      'creator-id': this.agent.userName,
      'initiating-plan': null
    };
    this.partyLcmService.initiateCase(payload).subscribe(response => {
      this.router.navigate(['/party-lifecycle-management/cases/' + response.id]);
    }, error => {
      if (error.error && error.error && error.error.message === 'already-exists') {
        const lastSpaceIndex = error.error.details.lastIndexOf(' ');
        this.caseId = error.error.details.substring(lastSpaceIndex + 1);
        this.openSnackBar('already-exists', 'Go to case');
      }

    });
  }

  send(selectedIdentificationDocument: string) {
    let formControlValue = '';
    let documentKind = '';
    const customerName = this.formGroup.controls['customerName']?.value;
    const nameOfLegalEntity = this.formGroup.controls['nameOfPl']?.value;
    // eslint-disable-next-line max-len
    const dateOfBirth = this.formGroup.controls['dateOfBirth']?.value;

    // Map selected identification document to form control values and document kinds
    const documentMap = {
      jmbg: { formControl: 'jmbg', kind: 'personal-id-number' },
      'broj-lk': { formControl: 'registrationNumber', kind: 'identity-card-number' },
      'broj-pasosa': { formControl: 'passportNumber', kind: 'passport-number' },
      'id-komitenta': { formControl: 'clientId', kind: 'id' },
      'mbr-org': { formControl: 'mbrNumber', kind: 'registration-number' },
      pib: { formControl: 'pib', kind: 'tax-id-number' }
    } as const;

    if (selectedIdentificationDocument in documentMap) {
      const documentKey = selectedIdentificationDocument as keyof typeof documentMap;
      formControlValue = this.formGroup.controls[documentMap[documentKey].formControl]?.value;
      documentKind = documentMap[documentKey].kind;
    } else {
      documentKind = 'default';
    }

    let queryParams = '';

    // Handle specific cases for document kind
    if (documentKind === 'id' && formControlValue) {
      queryParams = `/${formControlValue}`;
    } else if (documentKind === 'registration-number' && formControlValue) {
      queryParams = `?id-kind=${documentKind}&id-number=${formControlValue}`;
      const organizationNumber = this.formGroup.controls['organizationNumber']?.value || 'all';
      queryParams += `&branch-identifier=${organizationNumber}`;
    } else if (documentKind !== 'default' && formControlValue) {
      queryParams = `?id-kind=${documentKind}&id-number=${formControlValue}`;
    }

    const queryKind = this.isIndividualPerson ?
      'kind=individual' : 'kind=organization';
    queryParams += queryParams.includes('?') ? `&${queryKind}` : `?${queryKind}`;
    // Add customerName if it exists
    if (customerName) {
      queryParams += queryParams.includes('?') ? `&name=${customerName}` : `?name=${customerName}`;
    }

    // Add nameOfLegalEntity if it exists
    if (nameOfLegalEntity) {
      queryParams += queryParams.includes('?') ? `&name=${nameOfLegalEntity}` : `?name=${nameOfLegalEntity}`;
    }

    // Add dateOfBirth if it exists
    if (dateOfBirth) {
      const birthDate = dateOfBirth.toLocaleString('sv-SE', { timeZone: 'Europe/Berlin' }).replace(' ', 'T');
      queryParams += queryParams.includes('?') ? `&birth-date=${birthDate}` : `?birth-date=${birthDate}`;
    }

    // Log or send the queryParams only if there's a valid query
    if (queryParams) {
      this.partyService.getParty(queryParams).subscribe(response => {
        const hasParties = response?.parties?.length > 0;
        const isValidObject = typeof response === 'object' && response !== null && !response.hasOwnProperty('parties');

        if (hasParties || isValidObject) {
          if (response?.parties?.length > 1) {
            this.openDialog(response.parties);
          } else {
            this.selectedUser = response?.parties?.[0] || response;
            const val = response?.parties?.[0].registrationProfile || response.registrationProfile;
            this.setRegistrationProfile(val);
          }
        } else {
          this.openSnackBar('Nije pronadjen nijedan klijent', 'OK');
          this.selectedUser = null;
          this.setRegistrationProfile();
        }
      });
    } else {
      console.log('No valid query parameters to send.');
    }
  }


  openSnackBar(message: string, action: string) {
    const translatedMessage = this.translationService.translate(message);
    const translatedAction = this.translationService.translate(action);
    const snackBarRef = this.snackBar.open(translatedMessage, translatedAction, { duration: 15000 });

    snackBarRef.onAction().subscribe(() => {
      // Perform navigation on action click
      if (action === 'Go to case') {
        this.router.navigate(['/party-lifecycle-management/cases/' + this.caseId]); // Change to your desired route
      }
    });
  }
  // Method to mark control as touched
  markAsTouched(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

  setRegistrationProfile(value: any = null) {
    if (value) {
      const val = this.basisOptions.find((item: any) => item.literal === value);
      this.formGroup.controls['registrationProfile'].setValue(val);
      this.basisOfReg?.controlInternal.setValue(val);
      this.readonlyRP = true;
    } else {
      this.formGroup.controls['registrationProfile'].setValue(null);
      this.basisOfReg?.controlInternal.setValue(null);
      this.readonlyRP = false;
    }
  }

  checkValue(val: any) {
    if (!val.target.value) {
      this.formGroup.controls['dateOfBirth'].setValue(null);
      this.dateOfBirth?.controlDate.setValue(null);
    }
  }
  private getChannel() {
    const username = this.userService.getUsername();
    const channel = localStorage.getItem('selected_channel_' + username) || 'branch';
    return channel;
  }

}
