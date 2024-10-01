import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, EnvironmentService, HttpMethod } from '@asseco/common-ui';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartyService extends AbstractHttpClient {
  protected override defaultApiVersion = this.getApiVersion() ?? 'v1';
  protected serviceName = 'party';
  public url: string;
  constructor(protected override injector: Injector, protected override envService: EnvironmentService) {
    super(injector);
    this.url = this.getUrl();
  }

  public getParty(partyQueryParams: string): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}parties${partyQueryParams}`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

  public getMaritalStatus(): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}classifications/marital-statuses`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

  public getRegistrationProfiles(): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}classifications/registration-profiles`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

  public getEmploymentStatuses(): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}classifications/employment-statuses`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

  public getOrganizationSize(): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}classifications/organization-size`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }
}
