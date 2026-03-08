import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IIssue } from '../issue.model';
import { IssueService } from '../service/issue.service';

const issueResolve = (route: ActivatedRouteSnapshot): Observable<null | IIssue> => {
  const id = route.params.id;
  if (id) {
    return inject(IssueService)
      .find(id)
      .pipe(
        mergeMap((issue: HttpResponse<IIssue>) => {
          if (issue.body) {
            return of(issue.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default issueResolve;
