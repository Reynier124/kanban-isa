import { ILabel, NewLabel } from './label.model';

export const sampleWithRequiredData: ILabel = {
  id: 28258,
  name: 'impressive',
};

export const sampleWithPartialData: ILabel = {
  id: 29694,
  name: 'mechanic regularly gosh',
  color: 'olive',
};

export const sampleWithFullData: ILabel = {
  id: 11722,
  name: 'gloomy unless sew',
  color: 'black',
};

export const sampleWithNewData: NewLabel = {
  name: 'scaly save yum',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
