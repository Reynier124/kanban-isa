import { TestBed } from '@angular/core/testing';

import { IssueServiceTs } from './issue.service.ts';

describe('IssueServiceTs', () => {
  let service: IssueServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
