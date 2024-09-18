import { Case } from './case';
import { PagedList } from './pagedList';

/**
 * List of cases
 */
export interface PagedCaseList extends PagedList {
  /**
   * Collection of managed cases
   */
  lifecycleCases?: Array<Case>;
}
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PagedCaseList {
}
