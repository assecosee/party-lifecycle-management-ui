import { NgModule } from '@angular/core';
import { L10nIntlModule, L10nTranslationModule } from 'angular-l10n';
import { CommonUiModule } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { CommonModule } from '@angular/common';
import { PartyLcmUiModuleLoadService } from './services/party-lcm-ui-module-load.service';
import { PartyLifecycleManagementRoutingModule } from './party-lifecycle-management-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CaseListComponent } from './components/case/case-list/case-list.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { FilterCasesDialogComponent } from './components/dialogs/filter-cases-dialog/filter-cases-dialog.component';
import { CaseOverviewComponent } from './components/case/case-overview/case-overview.component';



@NgModule({
  declarations: [
    CaseListComponent,
    CaseOverviewComponent,
    FilterCasesDialogComponent
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
    InfiniteScrollDirective,
    L10nIntlModule
  ],
  exports: [
  ]
})
export class PartyLifecycleManagementModule {

  constructor(
    private partyLcmUiModuleLoadService: PartyLcmUiModuleLoadService
  ) {

  }

}
