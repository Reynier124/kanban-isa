import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IIssue, NewIssue } from '../issue.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IIssue for edit and NewIssueFormGroupInput for create.
 */
type IssueFormGroupInput = IIssue | PartialWithRequiredKeyOf<NewIssue>;

type IssueFormDefaults = Pick<NewIssue, 'id' | 'labels'>;

type IssueFormGroupContent = {
  id: FormControl<IIssue['id'] | NewIssue['id']>;
  title: FormControl<IIssue['title']>;
  description: FormControl<IIssue['description']>;
  status: FormControl<IIssue['status']>;
  user: FormControl<IIssue['user']>;
  labels: FormControl<IIssue['labels']>;
  project: FormControl<IIssue['project']>;
};

export type IssueFormGroup = FormGroup<IssueFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class IssueFormService {
  createIssueFormGroup(issue: IssueFormGroupInput = { id: null }): IssueFormGroup {
    const issueRawValue = {
      ...this.getFormDefaults(),
      ...issue,
    };
    return new FormGroup<IssueFormGroupContent>({
      id: new FormControl(
        { value: issueRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(issueRawValue.title, {
        validators: [Validators.required],
      }),
      description: new FormControl(issueRawValue.description),
      status: new FormControl(issueRawValue.status),
      user: new FormControl(issueRawValue.user),
      labels: new FormControl(issueRawValue.labels ?? []),
      project: new FormControl(issueRawValue.project),
    });
  }

  getIssue(form: IssueFormGroup): IIssue | NewIssue {
    return form.getRawValue() as IIssue | NewIssue;
  }

  resetForm(form: IssueFormGroup, issue: IssueFormGroupInput): void {
    const issueRawValue = { ...this.getFormDefaults(), ...issue };
    form.reset(
      {
        ...issueRawValue,
        id: { value: issueRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): IssueFormDefaults {
    return {
      id: null,
      labels: [],
    };
  }
}
