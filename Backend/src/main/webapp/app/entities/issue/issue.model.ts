import { IUser } from 'app/entities/user/user.model';
import { ILabel } from 'app/entities/label/label.model';
import { IProject } from 'app/entities/project/project.model';
import { IssueStatus } from 'app/entities/enumerations/issue-status.model';

export interface IIssue {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: keyof typeof IssueStatus | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
  labels?: Pick<ILabel, 'id' | 'name'>[] | null;
  project?: Pick<IProject, 'id' | 'name'> | null;
}

export type NewIssue = Omit<IIssue, 'id'> & { id: null };
