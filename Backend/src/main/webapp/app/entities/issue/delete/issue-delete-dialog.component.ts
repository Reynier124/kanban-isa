import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IIssue } from '../issue.model';
import { IssueService } from '../service/issue.service';

@Component({
  templateUrl: './issue-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class IssueDeleteDialogComponent {
  issue?: IIssue;

  protected issueService = inject(IssueService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.issueService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
