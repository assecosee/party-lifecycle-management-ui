import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { DirectoryService } from '../../services/directory.service';
import { AseeFormControl, IdentityProviderService } from '@asseco/common-ui';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../model/User';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { AgentSearchComponent } from '../agent-search/agent-search.component';

@Component({
  selector: 'lib-assigne-work-item-dialog',
  templateUrl: './assigne-work-item-dialog.component.html',
  styleUrl: './assigne-work-item-dialog.component.scss'
})
export class AssigneWorkItemDialogComponent implements OnInit{
  public defaultDirectory: string;
  public users: User[] | undefined;
  public assignWorkItemFormControl: AseeFormControl | undefined;
  public locale: L10nLocale;
  @ViewChild('agentSearch', { static: false }) agentAutoComplate: AgentSearchComponent;

  constructor(
    protected directoryService: DirectoryService,
    protected identityProvider: IdentityProviderService,
    private injector: Injector,
    public dialogRef: MatDialogRef<AssigneWorkItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){
    this.locale = injector.get(L10N_LOCALE);
  }
  ngOnInit(): void {
    this.InitForm();
  }
  InitForm(){
    this.assignWorkItemFormControl = new AseeFormControl(null);
  }
  ngAfterViewInit(){
    this.agentAutoComplate.onInit();
  }
  save(){
    const agent = this.assignWorkItemFormControl?.value;
    this.dialogRef.close(agent);
  }
  public cancel(): void {
    this.dialogRef.close(false);
  }

}
