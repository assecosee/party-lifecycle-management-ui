import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseListComponent } from './components/case/case-list/case-list.component';
import { CaseOverviewComponent } from './components/case/case-overview/case-overview.component';

const routes: Routes = [
  { path: 'party-lifecycle-management',
    children: [
      { path: 'cases', component: CaseListComponent },
      { path: 'cases/:caseNumber', component: CaseOverviewComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartyLifecycleManagementRoutingModule { }
