import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { IssueDetailComponent } from './issue-detail.component';

describe('Issue Management Detail Component', () => {
  let comp: IssueDetailComponent;
  let fixture: ComponentFixture<IssueDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./issue-detail.component').then(m => m.IssueDetailComponent),
              resolve: { issue: () => of({ id: 6256 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(IssueDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load issue on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', IssueDetailComponent);

      // THEN
      expect(instance.issue()).toEqual(expect.objectContaining({ id: 6256 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
