import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BrokerFacade, BrokerMessage } from '@asseco/common-ui';
import { MaterialTaskListComponent } from '@asseco/task-inbox';
import { L10nLocale } from 'angular-l10n';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'party-lcm-completed-tasks-list',
  templateUrl: './completed-tasks-list.component.html',
  styleUrl: './completed-tasks-list.component.scss'
})
export class CompletedTasksListComponent {
  @ViewChild('completedTasksContainer', { static: false }) public completedTasksContainer: MaterialTaskListComponent;
  public locale: L10nLocale;
  @Input() public caseNumber: string;
  @Input() public taskId: string;
  public displayedColumnsCompletedTasks: string[] = [];
  public params: any = {
    sortBy: 'create-time',
    sortOrder: 'desc'
  };
  private processStateSubscription: Subscription;
  constructor(
    protected cdr: ChangeDetectorRef,
    protected brokerFacade: BrokerFacade
  ) {
    this.processStateSubscription = this.brokerFacade.subscribe('bpm',
      'businessKey = \'' + this.caseNumber + '\' and kind = \'process-state-event\'')
      .pipe(debounceTime(500))
      .subscribe((message: BrokerMessage) => {
        this.completedTasksContainer.resetLoading(true);
      });
  }

  ngOnDestroy(): void {
    if (this.processStateSubscription) {
      this.processStateSubscription.unsubscribe();
    }
  }

  public adaptToSizeCompletedTasks(size: any) {
    if (!size) {
      size = this.completedTasksContainer.actualSize;
    }
    if (size >= 1444) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'created', 'due',
        'startTime', 'endTime', 'duration'];
    } else if (size >= 1280) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'created',
        'startTime', 'endTime', 'duration'];
    } else if (size >= 800) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'startTime',
        'endTime', 'duration'];
    } else if (size >= 500) {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'endTime', 'duration'];
    } else {
      this.displayedColumnsCompletedTasks = ['taskIcon', 'name', 'duration'];
    }
    this.cdr.detectChanges();
  }
}
