import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractUIInputComponent } from '@asseco/components-ui';
import { EMPTY, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
export interface ItemData {
  item: any;
  selected: boolean;
}
@Component({
  selector: 'party-lcm-multiselect-autocomplete',
  templateUrl: './multiselect-autocomplete.component.html',
  styleUrl: './multiselect-autocomplete.component.scss'
})
export class MultiselectAutocompleteComponent extends AbstractUIInputComponent<any> implements OnInit{
  @Output() result = new EventEmitter<{ key: string; data: Array<string> }>();

  @Input() data: Array<any> = [];
  @Input() key = '';
  @Input() appearance  = '';
  @Input() public valueProperty = 'value';
  @Input() public labelProperty = 'value';
  selectControl = new FormControl();

  rawData: Array<ItemData> = [];
  selectData: Array<ItemData> = [];

  filteredData: Observable<Array<ItemData>>;
  filterString = '';

  constructor(public override injector: Injector) {
    super(injector);
    this.loadElementRef();
  }

  override ngOnInit(): void {
    this.data.forEach((item: string) => {
      this.rawData.push({ item, selected: false });
    });
    this.filteredData = this.selectControl.valueChanges.pipe(
      startWith<string>(''),
      map(value => typeof value === 'string' ? value : this.filterString),
      map(filter => this.filter(filter))
    );
    super.ngOnInit();
  }
  filter = (filter: string): Array<ItemData> => {
    this.filterString = filter;
    if(this.selectData) {
      this.control.setValue(this.selectData, {emitEvent: false});
    }
    if (filter.length > 0) {
      return this.rawData.filter(option => option.item[this.labelProperty].toLowerCase().indexOf(filter.toLowerCase()) >= 0);
    } else {
      return this.rawData.slice();
    }
  };

  public displayCustomFunction(obj: any) {
    if (obj && obj.item && obj.item[this.labelProperty]) {
      return obj.item[this.labelProperty];
    } else {
      return null;
    }
  }

  optionClicked = (event: Event, data: ItemData): void => {
    event.stopPropagation();
    this.toggleSelection(data);
  };
  toggleSelection = (data: ItemData): void => {
    data.selected = !data.selected;

    if (data.selected === true) {
      this.selectData.push(data);
    } else {
      const i = this.selectData.findIndex(value => value.item === data.item);
      this.selectData.splice(i, 1);
    }

    this.control.setValue(this.selectData);
    this.emitAdjustedData();
  };

  emitAdjustedData = (): void => {
    const results: Array<string> = [];
    this.selectData.forEach((data: ItemData) => {
      results.push(data.item);
    });
    this.result.emit({ key: this.key, data: results });
  };

  removeChip = (data: ItemData): void => {
    this.toggleSelection(data);
  };
}
