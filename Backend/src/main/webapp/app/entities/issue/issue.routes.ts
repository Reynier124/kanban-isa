import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import IssueResolve from './route/issue-routing-resolve.service';

const issueRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/issue.component').then(m => m.IssueComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/issue-detail.component').then(m => m.IssueDetailComponent),
    resolve: {
      issue: IssueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/issue-update.component').then(m => m.IssueUpdateComponent),
    resolve: {
      issue: IssueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/issue-update.component').then(m => m.IssueUpdateComponent),
    resolve: {
      issue: IssueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default issueRoute;
