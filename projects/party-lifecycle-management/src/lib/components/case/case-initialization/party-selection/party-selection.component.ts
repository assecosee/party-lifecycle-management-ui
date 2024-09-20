import { AfterViewInit, Component, Inject, Injector, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';

@Component({
  selector: 'lib-party-selection',
  standalone: true,
  imports: [MaterialModule, L10nTranslationModule, L10nIntlModule],
  templateUrl: './party-selection.component.html',
  styleUrl: './party-selection.component.scss'
})
export class PartySelectionComponent implements AfterViewInit {

  public locale: L10nLocale;
  public isIndividualPerson = false;
  dataSource: MatTableDataSource<any>;
  public displayedColumns: string[] = [];
  public displayedColumnsLegalPerson: string[] =
    ['partyNumber', 'contactName', 'established', 'countryOfResidence', 'primaryId', 'primaryIdKind', 'branchIdentifier'];
  public displayedColumnsIndividualPerson: string[] =
    ['partyNumber', 'contactName', 'birthDate', 'countryOfResidence', 'primaryId', 'primaryIdKind'];
  public selectedRow: any; // To store the selected row
  public hoveredRow: any;  // To store the hovered row

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              protected injector: Injector,
              private dialogRef: MatDialogRef<PartySelectionComponent>) {
    this.locale = injector.get(L10N_LOCALE);
    this.dataSource = new MatTableDataSource(this.data.parties);
    this.isIndividualPerson = this.data.isIndividualPerson;
    this.displayedColumns = this.isIndividualPerson ?
      this.displayedColumnsIndividualPerson : this.displayedColumnsLegalPerson;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Filter method
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Row selection logic
  selectRow(row: any) {
    if (this.selectedRow === row) {
      this.selectedRow = undefined;
      return;
    }
    this.selectedRow = row;
  }

  // Row hover logic
  hoverRow(row: any) {
    this.hoveredRow = row;
  }

  select() {
    this.dialogRef.close(this.selectedRow);
  }

}
