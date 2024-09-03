import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseListComponent } from './components/case/case-list/case-list.component';
import { CaseOverviewComponent } from './components/case/case-overview/case-overview.component';
import { BasicDataComponent } from './components/basic-data/basic-data.component';
import { FinancialDataComponent } from './components/financial-data/financial-data.component';
import { CompanyProfileComponent } from './components/company-profile/company-profile.component';
import { AdditionalDataComponent } from './components/additional-data/additional-data.component';

const routes: Routes = [
  {
    path: 'party-lifecycle-management',
    children: [
      { path: 'cases', component: CaseListComponent },
      { path: 'cases/:caseNumber', component: CaseOverviewComponent },
    ],
  },
  {
    path: 'tasks/basic-data/:taskId',
    component: BasicDataComponent,
  },
  {
    path: 'tasks/financial-data/:taskId',
    component: FinancialDataComponent,
  },
  {
    path: 'tasks/company-profile/:taskId',
    component: CompanyProfileComponent,
  },
  {
    path: 'tasks/additional-data/:taskId',
    component: AdditionalDataComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartyLifecycleManagementRoutingModule {}
