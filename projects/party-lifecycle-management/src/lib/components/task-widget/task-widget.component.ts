import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BaseWidget } from '@asseco/components-ui';
import { MaterialTaskListComponent } from '@asseco/task-inbox';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { DashboardDataStoreService } from '../../services/dashboard-data-store.service';
import { Case } from '../../model/case';
import { BpmTasksHttpClient, BrokerFacade, BrokerMessage } from '@asseco/common-ui';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'lib-task-widget',
  templateUrl: './task-widget.component.html',
  styleUrl: './task-widget.component.scss'
})
export class TaskWidgetComponent extends BaseWidget implements OnInit{
  override title: string;
  override configuration?: any;
  public locale: L10nLocale;
  public taskObjectNumber: any;
  public caseNumber: string;
  @ViewChild('activeTasksContainer', { static: false }) public activeTasksContainer: MaterialTaskListComponent;
  public displayedColumnsCompletedTasks: string[] = [];
  public displayedColumnsActiveTasks: string[] = ['taskIcon', 'name', 'created', 'action'];
  public complateParams: any = {
    sortBy: 'create-time',
    sortOrder: 'desc'
  };
  public tabLabelIndex = 0;
  constructor(
    protected cdr: ChangeDetectorRef,
    protected dashboardDataService: DashboardDataStoreService,
    protected taskService: BpmTasksHttpClient,
    private injector: Injector,
    private brokerFacade: BrokerFacade
  ){
    super();
    this.locale = injector.get(L10N_LOCALE);
  }
  private processStateSubscription: Subscription;
  ngOnInit(): void {
    this.title = 'Tasks';
    this.dashboardDataService.subjects['case'].subscribe((dataCase: Case) => {
      this.caseNumber = dataCase.id;
    });
    this.processStateSubscription = this.brokerFacade.subscribe('bpm',
      'businessKey = \'' + this.caseNumber + '\' and kind = \'process-state-event\'')
      .pipe(debounceTime(500))
      .subscribe((message: BrokerMessage) => {
        this.activeTasksContainer.resetLoading(true);
      });
  }

  public tabChange(event: MatTabChangeEvent) {
    // eslint-disable-next-line prefer-const
    let tabLabelIndex = event.index;
    if (tabLabelIndex === 0) {
      this.tabLabelIndex = 0;
      this.activeTasksContainer.onDomChange();
    } else if (tabLabelIndex === 1) {
      this.tabLabelIndex = 1;
    }
  }

}
