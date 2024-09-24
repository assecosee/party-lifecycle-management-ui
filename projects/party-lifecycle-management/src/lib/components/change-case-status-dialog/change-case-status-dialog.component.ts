import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ClassificationSchema } from '../../model/classification-schema';
import { PartyLifecycleManagementService } from '../../services/party-lifecycle-management.service';
import { ClassificationValue } from '../../model/classification-value';
import { AseeFormControl, AseeFormGroup } from '@asseco/common-ui';
import { MaterialErrorDialogComponent } from '@asseco/components-ui';

@Component({
  selector: 'lib-change-case-status-dialog',
  templateUrl: './change-case-status-dialog.component.html',
  styleUrl: './change-case-status-dialog.component.scss'
})
export class ChangeCaseStatusDialogComponent implements OnInit{

  public caseStatuses: ClassificationValue[] | undefined;
  public statusFormControl: AseeFormControl | undefined;

  constructor(
    public dialogRef: MatDialogRef<ChangeCaseStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected partyLCM: PartyLifecycleManagementService,
    protected dialog: MatDialog
  ){}
  ngOnInit(): void {
    console.log(this.data);
    this.getCaseStatuses().subscribe(statuses => {
      this.caseStatuses = statuses.values;
    });
    this.InitFormControl();
  }
  private InitFormControl(){
    this.statusFormControl = new AseeFormControl(this.data.status);
  }
  private getCaseStatuses(): Observable<ClassificationSchema> {
    return this.partyLCM.getClassification('case-statuses');
  }
  save(){
    const body = {
      status: this.statusFormControl?.value
    };
    this.dialogRef.close(body);
  }
  public cancel(): void {
    this.dialogRef.close(false);
  }

}
