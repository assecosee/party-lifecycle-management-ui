/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/dot-notation */
import { ChangeDetectorRef, Component, ElementRef, inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, ConfigurationHttpClient,
  ErrorEmitterService, FormField, LoaderService } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialConfirmDialogComponent, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { combineLatest } from 'rxjs';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
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
  public relatedPartyList: any[] = [];
  protected router: Router;
  // public relatedPartyList: any[] = [
  //   {
  //     id: '1',
  //     kind: 'employment',
  //     role: 'employer',
  //     toParty: {
  //       number: 123,
  //       name: 'Tea Test',
  //       kind: 'organization'
  //     },
  //     subrole: 'sas'
  //   },
  //   {
  //     id: '2',
  //     kind: 'employment',
  //     role: 'employer',
  //     toParty: {
  //       number: 123,
  //       name: 'Tea Test',
  //       kind: 'organization'
  //     },
  //     subrole: 'sas'
  //   },
  //   {
  //     id: '3',
  //     kind: 'employment',
  //     role: 'employer',
  //     toParty: {
  //       number: 123,
  //       name: 'Tea Test',
  //       kind: 'organization'
  //     },
  //     subrole: 'sas'
  //   }
  // ];
  public validationErrors1: ValidationErrors[] = [
    {
      errorCode: 'relatedPartyExist',
      severity: 'error',
      errorMessage: 'lblForRelatedPartiyExistError.',
      fieldName: 'relatedPartyExist'
    }];
  public validationErrors2: ValidationErrors[] = [
    {
      errorCode: 'relatedPartyZTNotExist',
      severity: 'error',
      errorMessage: 'lblForPLZTNotExist.',
      fieldName: 'relatedPartyZTNotExist'
    }];
  public validationErrors3: ValidationErrors[] = [
    {
      errorCode: 'invalidTotalPercentage',
      severity: 'error',
      errorMessage: 'lblForInvalideTotalPercentage.',
      fieldName: 'invalidTotalPercentage'
    }];
  public newRelatedPartyList: any[] = [];
  public isOrganization = false;
  public displayedColumns = ['relationshipKind', 'name',
    'partyKind', 'actions'];

  public relationshipExist = false;
  public PLZTPartyNotExist = false;
  public totalPercentageValid = true;
  @ViewChild('tableContainer', { static: false }) private tableContainer: ElementRef;
  @ViewChild(MatTable) table: MatTable<any>;

  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  protected loaderService: LoaderService;
  readonly dialog = inject(MatDialog);
  private confirmDialog: MatDialogRef<MaterialConfirmDialogComponent>;

  constructor(
    protected injector: Injector,
    protected configurationService: ConfigurationHttpClient,
    private cdr: ChangeDetectorRef,
    protected errorEmitterService: ErrorEmitterService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.loaderService = this.injector.get(LoaderService);
    this.router = this.injector.get(Router);
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
                this.relatedPartyList = JSON.parse(this.toCamelCase(field.data.value));
              }
              else if (field.id === 'isLegalEntity' &&
                field.data &&
                field.data.value) {
                this.isOrganization = JSON.parse(field.data.value);
                if (this.isOrganization) {
                  this.submitDisable = true;
                }
              }
            });
          });
        });
      });
  }
  public openDialog() {
    const dialogRef = this.dialog.open(RelatedPartiesDialogComponent, {
      data: { isOrganization: this.isOrganization },
      height: '70%',
      width: '40%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result !== null) {
        const oldRelationshipExist = this.relatedPartyList.find(o => o.toParty.number === result.toParty.number);
        const newRelatedPartyListExist = this.newRelatedPartyList.find(o => o.toParty.number === result.toParty.number);
        if (oldRelationshipExist !== undefined || newRelatedPartyListExist !== undefined) {
          this.relationshipExist = true;
        }
        else {
          this.newRelatedPartyList.push(result);
          this.relatedPartyList.push(result);
          this.submitDisable = false;
          this.checkTotalPercentage();
          this.table.renderRows();
        }
      }
      this.chcekIfExistsPZ();
    });
  }
  public removeParty(i: any) {
    this.confirmDialog = this.dialog.open(MaterialConfirmDialogComponent,
      { data: 'Do you really want to remove this related party?' });
    this.confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.relatedPartyList.splice(i, 1);
        this.checkTotalPercentage();
        this.table.renderRows();
      }
    });
  }
  public checkTotalPercentage() {
    const totalPercentage = this.relatedPartyList.reduce((sum, currentItem) => {
      if (currentItem.subrole === 'OV') {
        sum = sum + currentItem.ownershipPercentage;
      }
      return sum;
    }, 0);
    if (totalPercentage > 100) {
      this.submitDisable = true;
      this.totalPercentageValid = false;
      this.cdr.detectChanges();
    }
    else {
      this.submitDisable = false;
      this.totalPercentageValid = true;
      this.cdr.detectChanges();
    }
  }
  public chcekIfExistsPZ() {
    if (this.isOrganization) {
      const relationshipTypeZTNew = this.newRelatedPartyList.find(o => o.subrole === 'ZT');
      const relationshipTypeZTOld = this.relatedPartyList.find(o => o.subrole === 'ZT');
      if (relationshipTypeZTNew === undefined) {
        if (relationshipTypeZTOld === undefined) {
          this.submitDisable = true;
        }
        else {
          this.submitDisable = false;
        }
      }
      else {
        this.submitDisable = false;
      }
    }
    else {
      this.submitDisable = false;
    }
  }

  private toCamelCase(str: any) {
    return str
      .split(/[-_]/)
      .map((word: any, index: any) => {
        if (index === 0) {
          return word;
        }

        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );
      })
      .join('');
  }
  public onSubmit() {
    this.formGroup = new FormGroup({});
    this.formGroup.addControl('relatedPartyList', new AseeFormControl(this.relatedPartyList));
    this.bpmTaskService.complete(this.task.id, this.formGroup)
      .build().subscribe((res) => {
        this.router.navigateByUrl('tasks');
      },
        (err) => {
          this.errorEmitterService.setError(err);
        }
      );
  }

}
