import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdditionalDataComponent } from './components/additional-data/additional-data.component';
import { BasicDataComponent } from './components/basic-data/basic-data.component';
import { CaseListComponent } from './components/case/case-list/case-list.component';
import { CaseOverviewComponent } from './components/case/case-overview/case-overview.component';
import { CompanyProfileComponent } from './components/company-profile/company-profile.component';
import { EmploymentDataComponent } from './components/employment-data/employment-data.component';
import { FinancialDataComponent } from './components/financial-data/financial-data.component';
import { IdentificationDocumentComponent } from './components/identification-document/identification-document.component';
import { ProcessSelectionComponent } from './components/process-selection/process-selection.component';
import { GeneralRegistrationDataComponent } from './components/general-registration-data/general-registration-data.component';
import { FormRegistrationBasisComponent } from './components/form-registration-basis/form-registration-basis.component';

import { SurveyGenericFormComponent } from './components/survey-generic-form/survey-generic-form.component';
import { AddressDataComponent } from './components/address-data/address-data.component';
import { CaseInitializationComponent } from './components/case/case-initialization/case-initialization.component';
import { ContactDataComponent } from './components/contact-data/contact-data.component';
import { RelatedPartiesComponent } from './components/related-parties/related-parties.component';

const routes: Routes = [
  {
    path: 'party-lifecycle-management',
    children: [
      { path: 'cases', component: CaseListComponent },
      { path: 'cases/case-initialization', component: CaseInitializationComponent },
      { path: 'cases/:caseNumber', component: CaseOverviewComponent },
    ],
  },
  {
    path: 'tasks/basic-data/:taskId',
    component: BasicDataComponent,
  },
  {
    path: 'tasks/basis-of-registration/:taskId',
    component: FormRegistrationBasisComponent,
  },
  {
    path: 'tasks/general-registration-data/:taskId',
    component: GeneralRegistrationDataComponent,
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
  {
    path: 'tasks/identification-document/:taskId',
    component: IdentificationDocumentComponent,
  },
  {
    path: 'tasks/process-selection/:taskId',
    component: ProcessSelectionComponent
  },
  {
    path: 'tasks/employment-data/:taskId',
    component: EmploymentDataComponent
  },
  {
    path: 'tasks/survey/:templateId/:taskId',
    component: SurveyGenericFormComponent,
  },
  {
    path: 'tasks/address-data/:taskId',
    component: AddressDataComponent
  },
  {
    path: 'tasks/contact-data/:taskId',
    component: ContactDataComponent
  },
  {
    path: 'tasks/related-parties/:taskId',
    component: RelatedPartiesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartyLifecycleManagementRoutingModule { }
