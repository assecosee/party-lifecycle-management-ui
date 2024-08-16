import { Component } from '@angular/core';
import { UIService } from '@asseco/common-ui';

@Component({
  selector: 'party-lcm-case-overview',
  templateUrl: './case-overview.component.html',
  styleUrl: './case-overview.component.scss'
})
export class CaseOverviewComponent {

   constructor(
    private uiService: UIService
   ) {
    this.uiService.setTitle('Case overview');
   }
}
