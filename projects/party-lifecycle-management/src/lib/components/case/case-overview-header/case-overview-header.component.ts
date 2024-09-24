/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable object-shorthand */
/* eslint-disable no-eval */
import { Component, inject, Injector, Input, OnInit } from '@angular/core';
import { Case } from '../../../model/case';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { ConfigurationHttpClient, MenuItem, Widget, WidgetMenuItem } from '@asseco/common-ui';
import { MaterialConfirmDialogComponent, MaterialErrorDialogComponent } from '@asseco/components-ui';
import { MatDialog } from '@angular/material/dialog';
import { FilterCasesDialogComponent } from '../../dialogs/filter-cases-dialog/filter-cases-dialog.component';
import { ChangeCaseStatusDialogComponent } from '../../change-case-status-dialog/change-case-status-dialog.component';
import { AssigneWorkItemDialogComponent } from '../../assigne-work-item-dialog/assigne-work-item-dialog.component';
import { PartyLifecycleManagementService } from '../../../services/party-lifecycle-management.service';

@Component({
  selector: 'case-overview-header',
  templateUrl: './case-overview-header.component.html',
  styleUrl: './case-overview-header.component.scss'
})

export class CaseOverviewHeaderComponent implements OnInit{
  @Input() set caseOverview(caseOverview: any){
    if(caseOverview !== undefined){
      this._caseOverview = caseOverview as Case;
    }
  }
  public locale: L10nLocale;
  public menuItems: WidgetMenuItem[];
  public callbackMap: Record<string, () => void> = {
    AssignWorkItem: this.AssignWorkItem.bind(this),
    ChangeStatusWI: this.ChangeStatusWI.bind(this),
    TakeoverWorkItem: this.TakeoverWorkItem.bind(this)
  };
  constructor(
    protected dialog: MatDialog,
    protected configService: ConfigurationHttpClient,
    private injector: Injector,
    protected partyLCM: PartyLifecycleManagementService
  ){
    this.locale = injector.get(L10N_LOCALE);
  }
  public _caseOverview: Case;
  ngOnInit(): void {
    this.configService.getEffective('party-lcm/case-overview-header/menu-items').addAuthentication().build().subscribe(e=>{
      this.menuItems = JSON.parse(e);
    });

  }

  public customMenuItemClick( callback: string): void {
    const callBackFunction = this.callbackMap[callback];
    callBackFunction();

  }
  public TakeoverWorkItem(){
    const confirmDialog = this.dialog.open(MaterialConfirmDialogComponent,
      { data: 'Are you sure that you want to assign this Work Item to you?' }
    );
    confirmDialog.afterClosed().subscribe(e => {
      if(e === 1){
        // ubaciti metodu za preuzimanje work itema kada bude bila gotova
        console.log('Takeover Work Item');
      }
    });
  }
  public ChangeStatusWI(){
    const changeDialog = this.dialog.open(ChangeCaseStatusDialogComponent,
      { data: this._caseOverview});
    changeDialog.afterClosed().subscribe(e => {
      if(e){
      this.partyLCM.patchCaseStatus(this._caseOverview.id, e).subscribe(result => {
      }, (error) => {
        this.dialog.open(MaterialErrorDialogComponent,
          {
            data: error
          }
        );
      });
    }
    });
  }
  public AssignWorkItem(){
    const AssignDialog = this.dialog.open(AssigneWorkItemDialogComponent,
      { data: this._caseOverview}
    );
    AssignDialog.afterClosed().subscribe(e => {
      if(e){
        // potrebno je dodati metodu za dodelu kada bude odradjena
        // e vraca object user-a.
        console.log(e);
      }
    }, (error) => {
      this.dialog.open(MaterialErrorDialogComponent,
        {
          data: error
        }
      );
    });
  }

}
