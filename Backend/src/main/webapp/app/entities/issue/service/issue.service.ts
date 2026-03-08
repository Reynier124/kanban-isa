import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IIssue, NewIssue } from '../issue.model';

export type PartialUpdateIssue = Partial<IIssue> & Pick<IIssue, 'id'>;

export type EntityResponseType = HttpResponse<IIssue>;
export type EntityArrayResponseType = HttpResponse<IIssue[]>;

@Injectable({ providedIn: 'root' })
export class IssueService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/issues');

  create(issue: NewIssue): Observable<EntityResponseType> {
    return this.http.post<IIssue>(this.resourceUrl, issue, { observe: 'response' });
  }

  update(issue: IIssue): Observable<EntityResponseType> {
    return this.http.put<IIssue>(`${this.resourceUrl}/${this.getIssueIdentifier(issue)}`, issue, { observe: 'response' });
  }

  partialUpdate(issue: PartialUpdateIssue): Observable<EntityResponseType> {
    return this.http.patch<IIssue>(`${this.resourceUrl}/${this.getIssueIdentifier(issue)}`, issue, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IIssue>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IIssue[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getIssueIdentifier(issue: Pick<IIssue, 'id'>): number {
    return issue.id;
  }

  compareIssue(o1: Pick<IIssue, 'id'> | null, o2: Pick<IIssue, 'id'> | null): boolean {
    return o1 && o2 ? this.getIssueIdentifier(o1) === this.getIssueIdentifier(o2) : o1 === o2;
  }

  addIssueToCollectionIfMissing<Type extends Pick<IIssue, 'id'>>(
    issueCollection: Type[],
    ...issuesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const issues: Type[] = issuesToCheck.filter(isPresent);
    if (issues.length > 0) {
      const issueCollectionIdentifiers = issueCollection.map(issueItem => this.getIssueIdentifier(issueItem));
      const issuesToAdd = issues.filter(issueItem => {
        const issueIdentifier = this.getIssueIdentifier(issueItem);
        if (issueCollectionIdentifiers.includes(issueIdentifier)) {
          return false;
        }
        issueCollectionIdentifiers.push(issueIdentifier);
        return true;
      });
      return [...issuesToAdd, ...issueCollection];
    }
    return issueCollection;
  }
}
