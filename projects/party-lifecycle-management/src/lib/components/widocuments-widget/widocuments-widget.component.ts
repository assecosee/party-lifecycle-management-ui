import { Component, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';

@Component({
  selector: 'lib-widocuments-widget',
  templateUrl: './widocuments-widget.component.html',
  styleUrl: './widocuments-widget.component.scss'
})
export class WIDocumentsWidgetComponent extends BaseWidget implements OnInit{
  override title: string;
  override configuration?: any;
  ngOnInit(): void {
    this.title = 'Documents';
  }

}
