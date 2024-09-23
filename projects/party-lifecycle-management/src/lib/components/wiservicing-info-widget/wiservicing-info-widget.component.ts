import { Component, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';

@Component({
  selector: 'lib-wiservicing-info-widget',
  templateUrl: './wiservicing-info-widget.component.html',
  styleUrl: './wiservicing-info-widget.component.scss'
})
export class WIServicingInfoWidgetComponent extends BaseWidget implements OnInit {
  override title: string;
  override configuration?: any;
  ngOnInit(): void {
    this.title = 'Servicing info';
  }

}
