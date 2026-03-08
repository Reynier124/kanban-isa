import { IProject, NewProject } from './project.model';

export const sampleWithRequiredData: IProject = {
  id: 22823,
  name: 'anxiously',
};

export const sampleWithPartialData: IProject = {
  id: 14992,
  name: 'testing zowie',
};

export const sampleWithFullData: IProject = {
  id: 1375,
  name: 'tray pack hydrolyze',
  description: 'as',
};

export const sampleWithNewData: NewProject = {
  name: 'zowie vice',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
