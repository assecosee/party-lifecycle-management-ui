import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AseeFormControl, AseeFormGroup, AssecoFormService, DirectoryHttpClient, UserModel, UserService } from '@asseco/common-ui';
import { debounceTime, distinctUntilChanged, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';
import { ClassificationSchema } from '../../../model/classification-schema';
import { ClassificationValue } from '../../../model/classification-value';
import { PartyLifecycleManagementService } from '../../../services/party-lifecycle-management.service';
import { ReferenceService } from '../../../services/reference.service';
import { ListChannels } from '../../../model/reference/listChannels';
import { Channel } from '../../../model/reference/channel';
import { FilterCaseCommandQuery } from '../../../model/filterCaseCommandQuery';

@Component({
  selector: 'party-lcm-filter-cases-dialog',
  templateUrl: './filter-cases-dialog.component.html',
  styleUrl: './filter-cases-dialog.component.scss'
})
export class FilterCasesDialogComponent implements OnInit {

  public filtersGroup: AseeFormGroup | undefined;
  public caseStatuses: ClassificationValue[] | undefined = [];
  public channels: Channel [] | undefined = new Array<Channel>();
  public agents: Observable<any> | undefined;
  private selectedAgent: UserModel | undefined;
  /**
   *
   */
  constructor(
    protected formService: AssecoFormService,
    protected partyLCM: PartyLifecycleManagementService,
    protected referenceService: ReferenceService,
    protected directoryHttpClient: DirectoryHttpClient,
    protected userService: UserService,
    public dialogRef: MatDialogRef<FilterCasesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FilterCaseCommandQuery,
  ) {

  }

  ngOnInit(): void {
    forkJoin([this.getCaseStatuses(), this.getChannels(), this.searchAgents(this.data.agent)]).subscribe(
      ([caseStatuses, channels, agents]: [ClassificationSchema, ListChannels, any]) => {
        if(agents && agents !== undefined) {
          this.selectedAgent = agents[0];
        }
        this.caseStatuses = caseStatuses.values;
        if(channels) {
          this.channels = channels.items;
        }
        this.initForm();
        this.lisentEnterAgent();
        this.initData();
      }
    );
  }

  filter() {
    this.dialogRef.close(this.filtersGroup?.getRawValue());
  }

  closeDialog() {
    this.dialogRef.close();
  }

  clearFilter() {
    const selectedFilters: any = {
      pageNumber: 1,
      pageSize: 30,
      sortBy: 'creation-time',
      sortOrder: 'desc',
    };
    this.dialogRef.close(selectedFilters);
  }

  private lisentEnterAgent() {
    this.agents = this.filtersGroup?.controls['agent'].valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap((r) => this.searchAgents(r || ''))
    );
  }

  private searchAgents(value?: any): Observable<any> {
    if (value && typeof (value) === 'string') {
      if (value.length < 0) {
        return Observable.create((observer: any) => {
          observer.next([]);
          observer.complete();
        });
      }
      const params: any = {
        q: value,
        directory: this.userService.tokenData.idp
      };
      return this.directoryHttpClient.getUsers(params).build()
        .pipe(
          map((response: any) => response.items));
    } else {
      return Observable.create((observer: any) => {
        observer.next();
        observer.complete();
      });
    }
  }

  private getCaseStatuses(): Observable<ClassificationSchema> {
    return this.partyLCM.getClassification('case-statuses');
  }

  private getChannels(): Observable<ListChannels> {
    return this.referenceService.getChannels();
  }

  private initForm() {
    this.filtersGroup = this.formService.getFormGroup('party-lcm/filter-cases-dialog',
      {
        id: new AseeFormControl(null),
        partyName: new AseeFormControl(null),
        partyNumber: new AseeFormControl(null),
        partyIdentificationNumber: new AseeFormControl(null),
        channel: new AseeFormControl(null),
        agent: new AseeFormControl(null),
        dateFrom: new AseeFormControl(null),
        dateTo: new AseeFormControl(null),
        statuses: new AseeFormControl(null)
      }
    );
  }

  private initData() {
    this.filtersGroup?.controls['id'].setValue(this.data?.id);
    this.filtersGroup?.controls['partyName'].setValue(this.data?.partyName);
    this.filtersGroup?.controls['partyIdentificationNumber'].setValue(this.data?.partyIdentificationNumber);
    if(this.selectedAgent && this.selectedAgent !== undefined) {
      this.filtersGroup?.controls['agent'].setValue(this.selectedAgent);
    }
    this.filtersGroup?.controls['partyNumber'].setValue(this.data?.partyNumber);
    this.filtersGroup?.controls['dateFrom'].setValue(this.data?.dateFrom);
    this.filtersGroup?.controls['dateTo'].setValue(this.data?.dateTo);
    if(this.data?.channel) {
      this.filtersGroup?.controls['channel'].setValue(this.data?.channel.split(','));
    }
    if(this.data?.statuses) {
      this.filtersGroup?.controls['statuses'].setValue(this.data?.statuses.split(','));
    }
  }

}
