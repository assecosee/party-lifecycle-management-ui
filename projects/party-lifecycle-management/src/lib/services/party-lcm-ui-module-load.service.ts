import { Injectable } from '@angular/core';
import { MenuItem, UIService} from '@asseco/common-ui';

@Injectable({
  providedIn: 'root'
})
export class PartyLcmUiModuleLoadService {
  private partyLcmMenuItem = new MenuItem({
    id: 'party-lcm-parent',
    name: 'Party Lifecycle Management',
    icon: 'pie_chart',
    priority: 1,
    children: [
      new MenuItem({
        id: 'party-lcm-list',
        name: 'List cases',
        icon: 'list',
        route: '/party-lifecycle-management/cases'
      }),
      new MenuItem({
        id: 'party-lcm-onboarding',
        name: 'New onboarding',
        icon: 'person_add',
        route: '/party-lifecycle-management/cases/case-initialization'
      })
    ]
  });

  constructor(
    private uiService: UIService
  ) {
    this.processMenuItems(this.partyLcmMenuItem);
  }
  processMenuItems(menuItem: MenuItem): void {
    this.uiService.addMenuItem(menuItem);
  }
}
