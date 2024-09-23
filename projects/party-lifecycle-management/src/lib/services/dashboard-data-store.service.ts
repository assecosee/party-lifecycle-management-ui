import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataStoreService {

  public subjects: { [key: string]: BehaviorSubject<any> } = {};
}
