import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonUiModule, WidgetService } from '@asseco/common-ui';
import { L10nIntlModule, L10nTranslationModule } from 'angular-l10n';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { MaterialTaskInboxModule } from '@asseco/task-inbox';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CheckUpWidgetComponent } from './components/check-up-widget/check-up-widget.component';
import { CaseListComponent } from './components/case/case-list/case-list.component';
import { CaseOverviewHeaderComponent } from './components/case/case-overview-header/case-overview-header.component';
import { CaseOverviewComponent } from './components/case/case-overview/case-overview.component';
import { ContextWidgetComponent } from './components/context-widget/context-widget.component';
import { FilterCasesDialogComponent } from './components/dialogs/filter-cases-dialog/filter-cases-dialog.component';
import { SurveyGenericFormComponent } from './components/survey-generic-form/survey-generic-form.component';
import { TaskWidgetComponent } from './components/task-widget/task-widget.component';
import { WIDocumentsWidgetComponent } from './components/widocuments-widget/widocuments-widget.component';
import { WIServicingInfoWidgetComponent } from './components/wiservicing-info-widget/wiservicing-info-widget.component';
import { PartyLifecycleManagementRoutingModule } from './party-lifecycle-management-routing.module';
import { PartyLcmUiModuleLoadService } from './services/party-lcm-ui-module-load.service';
import { TrackingWidgetComponent } from './components/tracking-widget/tracking-widget.component';
import { ChangeCaseStatusDialogComponent } from './components/change-case-status-dialog/change-case-status-dialog.component';
import { AssigneWorkItemDialogComponent } from './components/assigne-work-item-dialog/assigne-work-item-dialog.component';
import { AgentSearchComponent } from './components/agent-search/agent-search.component';
import { MultiselectAutocompleteComponent } from './utils/multiselect-autocomplete/multiselect-autocomplete.component';
import { IntegrationTracingComponent } from './components/integration-tracing/integration-tracing.component';
import { IntegrationTracingDetailsComponent } from
  './components/integration-tracing/integration-tracing-details/integration-tracing-details.component';
import { CaseDetailsWidgetComponent } from './components/case-details-widget/case-details-widget.component';



@NgModule({
  declarations: [
    CaseListComponent,
    CaseOverviewComponent,
    FilterCasesDialogComponent,
    SurveyGenericFormComponent,
    CaseOverviewHeaderComponent,
    WIDocumentsWidgetComponent,
    WIServicingInfoWidgetComponent,
    ContextWidgetComponent,
    TaskWidgetComponent,
    TrackingWidgetComponent,
    CheckUpWidgetComponent,
    ChangeCaseStatusDialogComponent,
    AssigneWorkItemDialogComponent,
    AgentSearchComponent,
    MultiselectAutocompleteComponent,
    IntegrationTracingComponent,
    IntegrationTracingDetailsComponent,
    CaseDetailsWidgetComponent
  ],
  imports: [
    PartyLifecycleManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    L10nTranslationModule,
    AssecoMaterialModule,
    CommonUiModule.forRoot(),
    MaterialModule,
    HttpClientModule,
    MaterialTaskInboxModule,
    InfiniteScrollDirective,
    L10nIntlModule
  ],
  exports: [
    WIDocumentsWidgetComponent,
    WIServicingInfoWidgetComponent,
    ContextWidgetComponent,
    TaskWidgetComponent,
    TrackingWidgetComponent,
    CheckUpWidgetComponent,
    AssigneWorkItemDialogComponent,
    AgentSearchComponent,
    IntegrationTracingComponent,
    IntegrationTracingDetailsComponent,
    CaseDetailsWidgetComponent
  ]
})
export class PartyLifecycleManagementModule {

  constructor(
    private partyLcmUiModuleLoadService: PartyLcmUiModuleLoadService,
    private widgetService: WidgetService
  ) {
    const widgets = [
      {
        title: 'Documents',
        componentName: 'WIDocumentsWidgetComponent',
        tags: ['case'],
        thumbnail: ''
      }, {
        title: 'Servicing Info',
        componentName: 'WIServicingInfoWidgetComponent',
        tags: ['case'],
        thumbnail: ''
      }, {
        title: 'Tasks',
        componentName: 'TaskWidgetComponent',
        tags: ['case'],
        thumbnail: ''
      }, {
        title: 'Context widget',
        componentName: 'ContextWidgetComponent',
        tags: ['case'],
        thumbnail: ''
      }, {
        title: 'Tracking widget',
        componentName: 'TrackingWidgetComponent',
        tags: ['case'],
        thumbnail: ''
      }, {
        title: 'Check ups widget',
        componentName: 'CheckUpWidgetComponent',
        tags: ['case'],
        thumbnail: ''
      },
      {
        title: 'Integration tracing widget',
        componentName: 'IntegrationTracingComponent',
        tags: ['case'],
        thumbnail: ''
      }
    ];
    widgets.forEach((widget) => {
      this.widgetService.registerWidget(widget);
    });

  }

}
