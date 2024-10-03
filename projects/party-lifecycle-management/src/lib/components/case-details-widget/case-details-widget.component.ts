import { Component, Inject, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BpmTasksHttpClient, EnvironmentConfig } from '@asseco/common-ui';
import { GenericScreenWidgetService } from '@asseco/task-inbox';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { PartyLifecycleManagementService } from '../../services/party-lifecycle-management.service';
import { Case } from '../../model/case';

@Component({
  selector: 'party-lcm-case-details-widget',
  templateUrl: './case-details-widget.component.html',
  styleUrl: './case-details-widget.component.scss'
})
export class CaseDetailsWidgetComponent implements OnInit, OnDestroy{
  public locale: L10nLocale;
  public case: Case;
  public caseTitle: string;
  @Input() set caseId(caseId: string) {
    if(caseId) {
      this.partyLcmService.getCaseById(caseId, this.filterCaseParams, true)
        .subscribe(
                (res: Case) => {
                  this.case = res;
                  if(this.case) {
                    this.caseTitle = this.transformCaseType(this.case.type);
                  }
                }
        );
    }
  }
  private filterCaseParams = {
    include: 'entity-info,servicing-info,context'
  };
  constructor(
    @Inject(EnvironmentConfig) protected environmentConfig: EnvironmentConfig,
    private router: Router,
    private injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected bpmTasksHttpClient: BpmTasksHttpClient,
    protected genericScreenWidgetService: GenericScreenWidgetService,
    protected partyLcmService: PartyLifecycleManagementService
  ) {
    this.locale = this.injector.get(L10N_LOCALE);
  }
  ngOnDestroy(): void {
    this.genericScreenWidgetService.clearMap();
  }
  ngOnInit(): void {
    if (this.router.url.startsWith('/tasks/generic-task/')) {
      const taskId = this.getTaskIdFromPath();
      if(taskId) {
        this.bpmTasksHttpClient.getTask(taskId).build().subscribe((task) => {
          if (task?.businessKey) {
            this.partyLcmService.getCaseById(task.businessKey, this.filterCaseParams, true)
              .subscribe(
                (res: Case) => {
                  this.case = res;
                  if(this.case) {
                    this.caseTitle = this.transformCaseType(this.case.type);
                  }
                }
              );
          }
        });
      }
    }
  }
  public openCaseOverview() {
    this.router.navigate([`party-lifecycle-management/cases/${this.case.id}`]);
  }
  private getTaskIdFromPath() {
    let taskId = this.router.url.split('/tasks/generic-task/').pop();
    if (taskId && taskId.indexOf('?') > -1) {
      taskId = taskId.split('?', taskId.length)[0];
    }
    return taskId;
  }
  private transformCaseType(type: string) {
    if(type) {
      const words = type.split('-');
      let caseType = '';
      words.forEach((w: string, i) => {
        if(i === 0) {
          w = this.capitalizeFirstLetter(w);
        }
        caseType += ' ' + w;
      });
      return caseType.trim();
    }
    return type;
  }
  private capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}
