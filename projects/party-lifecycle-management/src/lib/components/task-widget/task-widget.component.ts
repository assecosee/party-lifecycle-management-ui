import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BaseWidget } from '@asseco/components-ui';
import { MaterialTaskListComponent } from '@asseco/task-inbox';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { DashboardDataStoreService } from '../../services/dashboard-data-store.service';
import { Case } from '../../model/case';
import { BpmTasksHttpClient } from '@asseco/common-ui';

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
  @ViewChild('completedTasksContainer', { static: false }) public completedTasksContainer: MaterialTaskListComponent;
  public displayedColumnsCompletedTasks: string[] = [];
  public displayedColumnsActiveTasks: string[] = ['taskIcon', 'name', 'created', 'action'];
  constructor(
    protected cdr: ChangeDetectorRef,
    protected dashboardDataService: DashboardDataStoreService,
    protected taskService: BpmTasksHttpClient,
    private injector: Injector
  ){
    super();
    this.locale = injector.get(L10N_LOCALE);
  }
  ngOnInit(): void {
    this.title = 'Tasks';
    this.dashboardDataService.subjects['case'].subscribe((dataCase: Case) => {
      this.caseNumber = dataCase.id;
    });
  }
  public adaptToSizeCompletedTasks(size: any) {
    if (size >= 1444) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'created', 'due',
        'startTime', 'endTime', 'duration'];
    } else if (size >= 1280) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'created',
        'startTime', 'endTime', 'duration'];
    } else if (size >= 800) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'startTime',
        'endTime', 'duration'];
    } else if (size >= 600) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'endTime', 'duration'];
    } else {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'endTime','duration'];
    }
    this.cdr.detectChanges();
  }
  public tabChange(event: MatTabChangeEvent) {
    // eslint-disable-next-line prefer-const
    let tabLabel = event.tab.textLabel;
    if (tabLabel === 'Active') {
      if (this.activeTasksContainer) {
        this.activeTasksContainer.onDomChange();
      }
    } else if (tabLabel === 'History') {
      if (this.completedTasksContainer) {
        this.completedTasksContainer.onDomChange();
      }
    }
  }

}
