
export interface PagedList { 
    /**
     * Total number of items in collection
     */
    totalCount?: number;
    /**
     * Size of the page
     */
    pageSize?: number;
    /**
     * Index of current page
     */
    page?: number;
    /**
     * Total number of pages of set size
     */
    totalPages?: number;
    /**
     * Sort order (`asc` or `desc`). Default is asc
     */
    sortOrder?: PagedList.SortOrderEnum;
    /**
     * Attribute of the collection item to sort by
     */
    sortBy?: string;
}
export namespace PagedList {
    export type SortOrderEnum = 'asc' | 'desc';
    export const SortOrderEnum = {
        Asc: 'asc' as SortOrderEnum,
        Desc: 'desc' as SortOrderEnum
    };
}