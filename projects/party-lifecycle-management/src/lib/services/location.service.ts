import { HttpParams } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, EnvironmentService, HttpMethod } from '@asseco/common-ui';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends AbstractHttpClient {
  protected override defaultApiVersion = this.getApiVersion() ?? 'v1';
  protected serviceName = 'location';
  public url: string;
  constructor(protected override injector: Injector, protected override envService: EnvironmentService) {
    super(injector);
    this.url = this.getUrl();
  }

  public getPlacesByPlaceQuery(place: string): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}places`)
      .appendQueryParams(new HttpParams()
        .set('page-size', 100)
        .set('place', place))
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

}
