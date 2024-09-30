/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, inject, Injector, model, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, ConfigurationHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { CustomService } from '../../../services/custom.service';
import { ErrorHandlingComponent } from '../../../utils/error-handling/error-handling.component';
import { combineLatest } from 'rxjs';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'lib-related-parties-dialog',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent],
  templateUrl: './related-parties-dialog.component.html',
  styleUrl: './related-parties-dialog.component.scss'
})

export class RelatedPartiesDialogComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public relatedPartyConnectionTypeList: any[] = [];
  public isOrganization = false;

  readonly dialogRef = inject(MatDialogRef<RelatedPartiesDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly formD = model(this.data);

  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;

  constructor(protected injector: Injector,
              protected configurationService: ConfigurationHttpClient,
              private customService: CustomService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }
  ngOnInit(): void {
    this.customService.getClassification('JK2TPVZN').subscribe(response => {
      console.log('Response za tip veze ', response);
      response.items.map((element: any) =>
        element.formattedName = `${element.description} - ${element.name}`
      );
      this.relatedPartyConnectionTypeList = response;
    });
    combineLatest([this.activatedRoute.params])
      .subscribe((params) => {
        this.taskId = params[0]['taskId'];
        this.bpmTaskService.getFormData(this.taskId).build().subscribe((result) => {
          this.formFields = result;
          console.log('Form data: ', this.formFields);
        });
      });

  }
  public initForm() {
    this.formGroup.addControl('relatedPartyConnectionType', new AseeFormControl(null, [Validators.required]));
    this.formGroup.addControl('JMBG', new AseeFormControl(null, []));
    this.formGroup.addControl('organizationalPart', new AseeFormControl(null, []));
    this.formGroup.addControl('signatureRight', new AseeFormControl(null, []));
    this.formGroup.addControl('percentageOfOwnership', new AseeFormControl(null, []));
    this.formGroup.addControl('connectionActivity', new AseeFormControl(null, []));

    this.formGroup.controls['relatedPartyConnectionType'].valueChanges.subscribe(value => {
      if (value !== null && typeof value === 'object' && Object.keys(value).length > 0) {
        // this.formGroup.controls[organizationalPart].setValue(value.id);
        console.log(value);
      }
    });
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

}
