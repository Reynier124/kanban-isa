import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IIssue } from 'app/entities/issue/issue.model';
import { IssueService } from 'app/entities/issue/service/issue.service';
import { ILabel } from '../label.model';
import { LabelService } from '../service/label.service';
import { LabelFormGroup, LabelFormService } from './label-form.service';

@Component({
  selector: 'jhi-label-update',
  templateUrl: './label-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LabelUpdateComponent implements OnInit {
  isSaving = false;
  label: ILabel | null = null;

  issuesSharedCollection: IIssue[] = [];

  protected labelService = inject(LabelService);
  protected labelFormService = inject(LabelFormService);
  protected issueService = inject(IssueService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LabelFormGroup = this.labelFormService.createLabelFormGroup();

  compareIssue = (o1: IIssue | null, o2: IIssue | null): boolean => this.issueService.compareIssue(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ label }) => {
      this.label = label;
      if (label) {
        this.updateForm(label);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const label = this.labelFormService.getLabel(this.editForm);
    if (label.id !== null) {
      this.subscribeToSaveResponse(this.labelService.update(label));
    } else {
      this.subscribeToSaveResponse(this.labelService.create(label));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILabel>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(label: ILabel): void {
    this.label = label;
    this.labelFormService.resetForm(this.editForm, label);

    this.issuesSharedCollection = this.issueService.addIssueToCollectionIfMissing<IIssue>(
      this.issuesSharedCollection,
      ...(label.issues ?? []),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.issueService
      .query()
      .pipe(map((res: HttpResponse<IIssue[]>) => res.body ?? []))
      .pipe(map((issues: IIssue[]) => this.issueService.addIssueToCollectionIfMissing<IIssue>(issues, ...(this.label?.issues ?? []))))
      .subscribe((issues: IIssue[]) => (this.issuesSharedCollection = issues));
  }
}
