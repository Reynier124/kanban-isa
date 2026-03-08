import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ILabel } from 'app/entities/label/label.model';
import { LabelService } from 'app/entities/label/service/label.service';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { IssueStatus } from 'app/entities/enumerations/issue-status.model';
import { IssueService } from '../service/issue.service';
import { IIssue } from '../issue.model';
import { IssueFormGroup, IssueFormService } from './issue-form.service';

@Component({
  selector: 'jhi-issue-update',
  templateUrl: './issue-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class IssueUpdateComponent implements OnInit {
  isSaving = false;
  issue: IIssue | null = null;
  issueStatusValues = Object.keys(IssueStatus);

  usersSharedCollection: IUser[] = [];
  labelsSharedCollection: ILabel[] = [];
  projectsSharedCollection: IProject[] = [];

  protected issueService = inject(IssueService);
  protected issueFormService = inject(IssueFormService);
  protected userService = inject(UserService);
  protected labelService = inject(LabelService);
  protected projectService = inject(ProjectService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: IssueFormGroup = this.issueFormService.createIssueFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  compareLabel = (o1: ILabel | null, o2: ILabel | null): boolean => this.labelService.compareLabel(o1, o2);

  compareProject = (o1: IProject | null, o2: IProject | null): boolean => this.projectService.compareProject(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ issue }) => {
      this.issue = issue;
      if (issue) {
        this.updateForm(issue);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const issue = this.issueFormService.getIssue(this.editForm);
    if (issue.id !== null) {
      this.subscribeToSaveResponse(this.issueService.update(issue));
    } else {
      this.subscribeToSaveResponse(this.issueService.create(issue));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IIssue>>): void {
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

  protected updateForm(issue: IIssue): void {
    this.issue = issue;
    this.issueFormService.resetForm(this.editForm, issue);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, issue.user);
    this.labelsSharedCollection = this.labelService.addLabelToCollectionIfMissing<ILabel>(
      this.labelsSharedCollection,
      ...(issue.labels ?? []),
    );
    this.projectsSharedCollection = this.projectService.addProjectToCollectionIfMissing<IProject>(
      this.projectsSharedCollection,
      issue.project,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.issue?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

    this.labelService
      .query()
      .pipe(map((res: HttpResponse<ILabel[]>) => res.body ?? []))
      .pipe(map((labels: ILabel[]) => this.labelService.addLabelToCollectionIfMissing<ILabel>(labels, ...(this.issue?.labels ?? []))))
      .subscribe((labels: ILabel[]) => (this.labelsSharedCollection = labels));

    this.projectService
      .query()
      .pipe(map((res: HttpResponse<IProject[]>) => res.body ?? []))
      .pipe(map((projects: IProject[]) => this.projectService.addProjectToCollectionIfMissing<IProject>(projects, this.issue?.project)))
      .subscribe((projects: IProject[]) => (this.projectsSharedCollection = projects));
  }
}
