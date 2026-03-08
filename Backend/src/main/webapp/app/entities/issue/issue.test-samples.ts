import { IIssue, NewIssue } from './issue.model';

export const sampleWithRequiredData: IIssue = {
  id: 7569,
  title: 'blight',
};

export const sampleWithPartialData: IIssue = {
  id: 19511,
  title: 'holster',
};

export const sampleWithFullData: IIssue = {
  id: 23509,
  title: 'jeopardise',
  description: 'next',
  status: 'CLOSED',
};

export const sampleWithNewData: NewIssue = {
  title: 'truly honestly ha',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
