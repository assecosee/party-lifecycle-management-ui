/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, ElementRef, inject, Injector, model, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BpmTasksHttpClient, ConfigurationHttpClient, FormField, LoaderService } from '@asseco/common-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { combineLatest } from 'rxjs';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RelatedPartiesDialogComponent } from './related-parties-dialog/related-parties-dialog.component';
@Component({
  selector: 'lib-related-parties',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, UppercaseDirective],
  templateUrl: './related-parties.component.html',
  styleUrl: './related-parties.component.scss'
})
export class RelatedPartiesComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public submitDisable = false;
  public formFields: FormField[] = [];
  public formGroup: FormGroup = new FormGroup({});
  public relatedPartyList: any[] = [
    {
      id: '1',
      kind: 'employment',
      role: 'employer',
      toParty: {
        number: 123,
        name: 'Tea Test',
        kind: 'organization'
      },
      aubrole: 'sas'
    },
    {
      id: '2',
      kind: 'employment',
      role: 'employer',
      toParty: {
        number: 123,
        name: 'Tea Test',
        kind: 'organization'
      },
      aubrole: 'sas'
    },
    {
      id: '3',
      kind: 'employment',
      role: 'employer',
      toParty: {
        number: 123,
        name: 'Tea Test',
        kind: 'organization'
      },
      aubrole: 'sas'
    }
  ];
  public isOrganization = false;
  public displayedColumns = ['id', 'relationshipKind', 'role', 'name',
    'clientKind'];

  @ViewChild('tableContainer', { static: false }) private tableContainer: ElementRef;

  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  readonly dialog = inject(MatDialog);
  readonly animal = signal('');
  readonly name = model('');

  constructor(
    protected injector: Injector,
    protected configurationService: ConfigurationHttpClient,) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    combineLatest([this.activatedRoute.params])
      .subscribe((params) => {
        this.taskId = params[0]['taskId'];
        this.bpmTaskService.getTask(this.taskId).build().subscribe((task) => {
          this.task = task;
          this.bpmTaskService.getFormData(this.taskId).build().subscribe((result) => {
            this.formFields = result;
            result.forEach((field) => {
              if (field.id === 'relatedPartyList' &&
                field.data &&
                field.data.value) {
                this.relatedPartyList = JSON.parse(field.data.value);
              }
              else if (field.id === 'isOrganization' &&
                field.data &&
                field.data.value) {
                this.isOrganization = JSON.parse(field.data.value);
              }
            });

            console.log('Form data: ', this.formFields);
          });
        });
      });
  }
  public formInit() {

  }
  public onSubmit(){

    console.log(this.formGroup);
  }
  public openDialog() {
    const dialogRef = this.dialog.open(RelatedPartiesDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log('Rezultat dodavanja: ',result);
      }
    });
  }

}
