import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IIssue } from '../issue.model';

@Component({
  selector: 'jhi-issue-detail',
  templateUrl: './issue-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class IssueDetailComponent {
  issue = input<IIssue | null>(null);

  previousState(): void {
    window.history.back();
  }
}
