import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonUiModule, WidgetService } from '@asseco/common-ui';
import { L10nIntlModule, L10nTranslationModule } from 'angular-l10n';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { MaterialTaskInboxModule } from '@asseco/task-inbox';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CheckUpWidgetComponent, TrackingWidgetComponent } from '../public-api';
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
    CheckUpWidgetComponent
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
    CheckUpWidgetComponent
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
      }
    ];
    widgets.forEach((widget) => {
      this.widgetService.registerWidget(widget);
    });

  }

}
