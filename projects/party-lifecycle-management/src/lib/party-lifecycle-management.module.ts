import { NgModule } from '@angular/core';
import { L10nTranslationModule } from 'angular-l10n';
import { CommonUiModule } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PartyLcmUiModuleLoadService } from './services/party-lcm-ui-module-load.service';

const routes: Routes = [
];

@NgModule({
  declarations: [
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
  ]
})
export class PartyLifecycleManagementModule { 

  constructor(
    private partyLcmUiModuleLoadService: PartyLcmUiModuleLoadService
  ) {
    
  }

}
