import { IIssue } from 'app/entities/issue/issue.model';

export interface ILabel {
  id: number;
  name?: string | null;
  color?: string | null;
  issues?: Pick<IIssue, 'id'>[] | null;
}

export type NewLabel = Omit<ILabel, 'id'> & { id: null };
