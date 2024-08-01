import { NgModule } from '@angular/core';
import { L10nTranslationModule } from 'angular-l10n';
import { CommonUiModule } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PartyLifecycleManagementComponent } from './party-lifecycle-management.component';

const routes: Routes = [
  { path: '', component: PartyLifecycleManagementComponent }
];

@NgModule({
  declarations: [
    PartyLifecycleManagementComponent
  ],
  imports: [
    CommonModule,
    CommonUiModule,
    MaterialModule,
    AssecoMaterialModule,
    L10nTranslationModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    PartyLifecycleManagementComponent
  ]
})
export class PartyLifecycleManagementModule { 

}
