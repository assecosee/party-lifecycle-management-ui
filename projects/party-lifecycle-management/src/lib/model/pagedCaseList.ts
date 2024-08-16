import { Case } from './case';
import { PagedList } from './pagedList';

/**
 * List of cases
 */
export interface PagedCaseList extends PagedList { 
    /**
     * Collection of managed cases
     */
    cases?: Array<Case>;
}
export namespace PagedCaseList {
}