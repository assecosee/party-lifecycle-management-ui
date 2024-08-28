import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseListComponent } from './components/case/case-list/case-list.component';
import { CaseOverviewComponent } from './components/case/case-overview/case-overview.component';
import { BasicDataComponent } from './components/basic-data/basic-data.component';

const routes: Routes = [
  { path: 'party-lifecycle-management',
    children: [
      { path: 'cases', component: CaseListComponent },
      { path: 'cases/:caseNumber', component: CaseOverviewComponent }
    ]
  },
  {
    path: 'tasks/basic-data/:taskId',
    component: BasicDataComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartyLifecycleManagementRoutingModule { }
