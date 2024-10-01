/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, Inject, inject, Injector, model, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, ConfigurationHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { CustomService } from '../../../services/custom.service';
import { ErrorHandlingComponent } from '../../../utils/error-handling/error-handling.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'lib-related-parties-dialog',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent],
  templateUrl: './related-parties-dialog.component.html',
  styleUrl: './related-parties-dialog.component.scss',
  providers: [DatePipe]
})

export class RelatedPartiesDialogComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public relatedPartyConnectionTypeList: any[] = [];
  public isOrganization = false;
  public formattedDate: any;
  public submitDisable = true;

  readonly dialogRef = inject(MatDialogRef<RelatedPartiesDialogComponent>);

  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;

  constructor(protected injector: Injector,
              protected configurationService: ConfigurationHttpClient,
              private customService: CustomService,
              private datePipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: {isOrganization: string}) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
    const today = new Date();
    this.formattedDate = this.datePipe.transform(today, 'yyyy-MM-dd');
  }
  ngOnInit(): void {
    this.customService.getClassification('JK2TPVZN').subscribe(response => {
      response.items.map((element: any) =>
        element.formattedName = `${element.description} - ${element.name}`
      );
      this.relatedPartyConnectionTypeList = response.items;
      this.initForm();
    });
  }
  public initForm() {
    this.formGroup.addControl('relatedPartyConnectionType', new AseeFormControl(null, [Validators.required]));
    this.formGroup.addControl('party', new AseeFormControl(null, [Validators.required]));
    this.formGroup.addControl('organizationalPart', new AseeFormControl(null, []));
    this.formGroup.addControl('signatureRight', new AseeFormControl(null, []));
    this.formGroup.addControl('percentageOfOwnership', new AseeFormControl(null, [this.belowHundredPercent()]));
    this.formGroup.addControl('connectionActivity', new AseeFormControl(true, []));

    this.formGroup.valueChanges.subscribe(val =>{
      if(this.formGroup.invalid){
        this.submitDisable = true;
      }
      else{
        this.submitDisable = false;
      }
    });
    this.formGroup.controls['party'].valueChanges.subscribe(value => {
      if (value !== null && typeof value === 'object' && Object.keys(value).length > 0) {
        if(this.formGroup.controls['party'].value.kind === 'organization'){
          this.formGroup.controls['organizationalPart'].setValue(this.formGroup.controls['party'].value.branchIdentifier);
          this.formGroup.controls['organizationalPart'].disable();
          this.submitDisable = false;
        }
      }
      else {
        this.submitDisable = true;
      }
    });
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
  public saveData(){
    let partyData = this.formGroup.controls['party'].value;
    if(this.data.isOrganization){
      let orgParty = {
        kind: 'representation',
        subrole: this.formGroup.controls['relatedPartyConnectionType'].value?.name,
        toParty: {
          number: partyData['partyNumber'],
          name: partyData['registeredName'],
          kind: partyData['kind']
        },
        ownershipPercentage:this.formGroup.controls['percentageOfOwnership']?.value,
        endDate: this.formGroup.controls['connectionActivity'].value === true? '' : this.formattedDate,
        additionalData:{
          rightToSign: this.formGroup.controls['signatureRight'].value
        }
      };
      this.dialogRef.close(orgParty);
    }
    else{
      let newParty = {
        kind: 'representation',
        role: 'representative',
        subrole: this.formGroup.controls['relatedPartyConnectionType'].value?.name,
        toParty: {
          number: partyData['partyNumber'],
          name: partyData['fullName'],
          kind: partyData['kind']
        },
        endDate: this.formGroup.controls['connectionActivity'].value === true? '' : this.formattedDate,
        additionalData:{
          rightToSign: this.formGroup.controls['signatureRight'].value
        }
      };
      this.dialogRef.close(newParty);
    }
  }
  private belowHundredPercent(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      (control.value>100 ? { belowHundredPercent: { value: control.value } } : null);
  }
}
