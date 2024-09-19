import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, EnvironmentService, HttpMethod } from '@asseco/common-ui';
import { Observable } from 'rxjs';
import { SurveyTemplate } from '../model/survey-template';

@Injectable({
  providedIn: 'root'
})
export class SurveyService extends AbstractHttpClient {
  protected override defaultApiVersion = this.getApiVersion() ?? 'v1';
  protected serviceName = 'survey';
  public url: string;
  constructor(
    protected override envService: EnvironmentService,
    protected override injector: Injector,
  ) {
    super(injector);
    this.url = this.envService.getServiceUrl(this.serviceName);
  }

  public getTemplateDetails(templateId: string): Observable<SurveyTemplate>{
    const builder = this.getHttpClientBuilder<SurveyTemplate>()
      .setUrl(`${this.url}templates/${templateId}/details`)
      .setHttpMethod(HttpMethod.GET)
      .addHeader('TenantId', 'default')
      .addAuthentication()
      .mapResponseToCamelCase();
    return builder.build();
  }
}
