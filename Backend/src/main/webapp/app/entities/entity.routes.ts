import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'Authorities' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'project',
    data: { pageTitle: 'Projects' },
    loadChildren: () => import('./project/project.routes'),
  },
  {
    path: 'issue',
    data: { pageTitle: 'Issues' },
    loadChildren: () => import('./issue/issue.routes'),
  },
  {
    path: 'label',
    data: { pageTitle: 'Labels' },
    loadChildren: () => import('./label/label.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
