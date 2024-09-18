import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AseeFormControl, AseeFormGroup, AssecoFormService } from '@asseco/common-ui';
import { forkJoin, Observable, of } from 'rxjs';
import { ClassificationSchema } from '../../../model/classification-schema';
import { ClassificationValue } from '../../../model/classification-value';

@Component({
  selector: 'party-lcm-filter-cases-dialog',
  templateUrl: './filter-cases-dialog.component.html',
  styleUrl: './filter-cases-dialog.component.scss'
})
export class FilterCasesDialogComponent implements OnInit {

  public filtersGroup: AseeFormGroup | undefined;
  public caseStatuses: ClassificationValue[] | undefined = [];
  public channels  = [];
  /**
   *
   */
  constructor(
    protected formService: AssecoFormService,
    public dialogRef: MatDialogRef<FilterCasesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

  }

  ngOnInit(): void {
    forkJoin([this.getCaseStatuses(), this.getChannels()]).subscribe(
      ([caseStatuses, channels]: [ClassificationSchema, any]) => {
        this.caseStatuses = caseStatuses.values;
        this.channels  = channels.items;
        this.initForm();
      }
    );
  }

  filter() {
    throw new Error('Method not implemented.');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  clearFilter() {
    if(this.filtersGroup) {
      this.filtersGroup.reset();
    }
  }

  private getCaseStatuses(): Observable<ClassificationSchema> {
    return of({
      values: [
        {
          literal: 'opened',
          name: 'Opened',
          description: 'Case opened'
        },
        {
          literal: 'canceled',
          name: 'Canceled',
          description: 'Customer canceled at any point'
        },
        {
          literal: 'active',
          name: 'Active',
          description: 'Case in process'
        },
        {
          literal: 'rejected',
          name: 'Rejected',
          description: 'Negative decision'
        },
        {
          literal: 'approved',
          name: 'Approved',
          description: 'Positive decision'
        },
        {
          literal: 'accepted',
          name: 'Accepted',
          description: 'Customer accepted case'
        },
        {
          literal: 'completed',
          name: 'Completed',
          description: 'Case completed'
        }
      ],
      'schema-id': 'case-status',
      name: 'Case Status',
      description: 'Case Status description'
    } as ClassificationSchema);
  }

  private getChannels(): Observable<any> {
    return of(
      {
        items: [
          {
            code: 'branch',
            literal: 'Branch',
            description: 'Branch channel',
            'is-leaf': true,
            'responsible-organization-unit-code': '0'
          },
          {
            code: 'web',
            literal: 'Web',
            description: 'Web channel',
            'is-leaf': true,
            'responsible-organization-unit-code': '0'
          },
          {
            code: 'web-new',
            literal: 'web-new',
            description: 'Web new',
            'is-leaf': true,
            'responsible-organization-unit-code': '0'
          }
        ]
      }
    );
  }

  private initForm() {
    this.filtersGroup = this.formService.getFormGroup('party-lcm/filter-cases-dialog',
      {
        caseNumber: new AseeFormControl(null),
        partyName: new AseeFormControl(null),
        partyNumber: new AseeFormControl(null),
        partyIdentificationNumber: new AseeFormControl(null),
        channels: new AseeFormControl(null),
        agent: new AseeFormControl(null),
        dateFrom: new AseeFormControl(null),
        dateTo: new AseeFormControl(null)
      }
    );
  }

}
