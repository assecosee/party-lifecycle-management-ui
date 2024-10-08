import { AfterViewInit, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { SubscriptSizing } from '@angular/material/form-field';
import { AseeFormControl } from '@asseco/common-ui';
import { AbstractUIInputComponent } from '@asseco/components-ui';
import { Observable } from 'rxjs';
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
export class MultiselectAutocompleteComponent extends AbstractUIInputComponent<any> implements OnInit, AfterViewInit {

  @Output() result = new EventEmitter<{ key: string; data: Array<string> }>();
  @Input() data: Array<any> = [];
  @Input() key = '';
  @Input() appearance  = '';
  @Input() public valueProperty = 'value';
  @Input() public labelProperty = 'value';
  @Input() public subscriptSizing: SubscriptSizing = 'fixed';
  @Input() public setValue: Function;
  public errorMessages: any;
  selectControl = new FormControl();
  @ViewChild('auto', { static: false }) public autocomplete: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger, { static: false }) private autoTrigger: MatAutocompleteTrigger;

  rawData: Array<ItemData> = [];
  selectData: Array<ItemData> = [];

  filteredData: Observable<Array<ItemData>>;
  filterString = '';

  constructor(public override injector: Injector) {
    super(injector);
    this.loadElementRef();
  }
  ngAfterViewInit(): void {
    const controlValues = this.setValue(this.controlName);
    if(controlValues && controlValues.length) {
      controlValues.forEach(
        (e: any) => {
          const item = this.data.find((d: any) => d[this.valueProperty] === e);
          this.toggleSelection({
            item,
            selected: false
          });
        }
      );
    }
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
    const errors: any = this.control.validator && this.control.validator(new AseeFormControl(null));
    const required = errors !== null && errors.required;
    this.required = required;
    if(this.required) {
      if(!this.errorMessages) {
        this.errorMessages = {};
      }
      this.errorMessages.required = true;
    }
    this.control.statusChanges.subscribe(
      (res) => {
        const listErrors: any = this.control.errors;
        if(res === 'INVALID') {
          this.errorMessages  = listErrors;
        } else {
          this.errorMessages  = listErrors;
        }
      }
    );
    this.selectControl.statusChanges.subscribe(
      (res) => {
        if(res === 'INVALID' && this.selectData) {
          this.selectControl.setValue(this.selectData, {emitEvent: false});
        }
      }
    );
    super.ngOnInit();
  }
  filter = (filter: string): Array<ItemData> => {
    this.filterString = filter;
    if(this.selectData) {
      if(this.selectData.length) {
        const listValues: string [] = [];
        this.selectData.forEach(
          (el: ItemData) => {
            if(el.item[this.valueProperty]) {
              listValues.push(el.item[this.valueProperty]);
            }
          }
        );
        this.control.setValue(listValues);
      }
      // this.selectControl.setValue(this.selectData, {emitEvent: false});
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
    if(this.selectData.length) {
      const listValues: string [] = [];
      this.selectData.forEach(
        (el: ItemData) => {
          if(el.item[this.valueProperty]) {
            listValues.push(el.item[this.valueProperty]);
          }
        }
      );
      this.control.setValue(listValues);
    }
    this.selectControl.setValue(this.selectData, {emitEvent: false});
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
  resetOnBlur(event: any) {
    if (event && event.relatedTarget && event.relatedTarget.classList) {
      const isOption = event.relatedTarget.classList.value.indexOf('mat-mdc-option') > -1;
      if (isOption) {
        return;
      }
    }
  }
  onSelectionChange(event: Event, data: ItemData) {
    this.autoTrigger.openPanel();
    this.toggleSelection(data);
  }
}
