export interface FilterCaseCommandQuery {
  partyName?: string;
  partyNumber?: string;
  id?: string;
  statuses?: string;
  channel?: string;
  partyIdentificationNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  agent?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
  sortOrder?: FilterCaseCommandQuery.SortOrderEnum;
  sortBy?: string;
  include?: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FilterCaseCommandQuery {
  export type SortOrderEnum = 'asc' | 'desc';
  export const SortOrderEnum = {
    Asc: 'asc' as SortOrderEnum,
    Desc: 'desc' as SortOrderEnum
  };
}
