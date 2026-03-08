import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ILabel } from 'app/entities/label/label.model';
import { LabelService } from 'app/entities/label/service/label.service';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { IIssue } from '../issue.model';
import { IssueService } from '../service/issue.service';
import { IssueFormService } from './issue-form.service';

import { IssueUpdateComponent } from './issue-update.component';

describe('Issue Management Update Component', () => {
  let comp: IssueUpdateComponent;
  let fixture: ComponentFixture<IssueUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let issueFormService: IssueFormService;
  let issueService: IssueService;
  let userService: UserService;
  let labelService: LabelService;
  let projectService: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IssueUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(IssueUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(IssueUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    issueFormService = TestBed.inject(IssueFormService);
    issueService = TestBed.inject(IssueService);
    userService = TestBed.inject(UserService);
    labelService = TestBed.inject(LabelService);
    projectService = TestBed.inject(ProjectService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call User query and add missing value', () => {
      const issue: IIssue = { id: 29374 };
      const user: IUser = { id: 3944 };
      issue.user = user;

      const userCollection: IUser[] = [{ id: 3944 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ issue });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('should call Label query and add missing value', () => {
      const issue: IIssue = { id: 29374 };
      const labels: ILabel[] = [{ id: 4199 }];
      issue.labels = labels;

      const labelCollection: ILabel[] = [{ id: 4199 }];
      jest.spyOn(labelService, 'query').mockReturnValue(of(new HttpResponse({ body: labelCollection })));
      const additionalLabels = [...labels];
      const expectedCollection: ILabel[] = [...additionalLabels, ...labelCollection];
      jest.spyOn(labelService, 'addLabelToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ issue });
      comp.ngOnInit();

      expect(labelService.query).toHaveBeenCalled();
      expect(labelService.addLabelToCollectionIfMissing).toHaveBeenCalledWith(
        labelCollection,
        ...additionalLabels.map(expect.objectContaining),
      );
      expect(comp.labelsSharedCollection).toEqual(expectedCollection);
    });

    it('should call Project query and add missing value', () => {
      const issue: IIssue = { id: 29374 };
      const project: IProject = { id: 10300 };
      issue.project = project;

      const projectCollection: IProject[] = [{ id: 10300 }];
      jest.spyOn(projectService, 'query').mockReturnValue(of(new HttpResponse({ body: projectCollection })));
      const additionalProjects = [project];
      const expectedCollection: IProject[] = [...additionalProjects, ...projectCollection];
      jest.spyOn(projectService, 'addProjectToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ issue });
      comp.ngOnInit();

      expect(projectService.query).toHaveBeenCalled();
      expect(projectService.addProjectToCollectionIfMissing).toHaveBeenCalledWith(
        projectCollection,
        ...additionalProjects.map(expect.objectContaining),
      );
      expect(comp.projectsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const issue: IIssue = { id: 29374 };
      const user: IUser = { id: 3944 };
      issue.user = user;
      const label: ILabel = { id: 4199 };
      issue.labels = [label];
      const project: IProject = { id: 10300 };
      issue.project = project;

      activatedRoute.data = of({ issue });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContainEqual(user);
      expect(comp.labelsSharedCollection).toContainEqual(label);
      expect(comp.projectsSharedCollection).toContainEqual(project);
      expect(comp.issue).toEqual(issue);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IIssue>>();
      const issue = { id: 6256 };
      jest.spyOn(issueFormService, 'getIssue').mockReturnValue(issue);
      jest.spyOn(issueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ issue });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: issue }));
      saveSubject.complete();

      // THEN
      expect(issueFormService.getIssue).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(issueService.update).toHaveBeenCalledWith(expect.objectContaining(issue));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IIssue>>();
      const issue = { id: 6256 };
      jest.spyOn(issueFormService, 'getIssue').mockReturnValue({ id: null });
      jest.spyOn(issueService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ issue: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: issue }));
      saveSubject.complete();

      // THEN
      expect(issueFormService.getIssue).toHaveBeenCalled();
      expect(issueService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IIssue>>();
      const issue = { id: 6256 };
      jest.spyOn(issueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ issue });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(issueService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('should forward to userService', () => {
        const entity = { id: 3944 };
        const entity2 = { id: 6275 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareLabel', () => {
      it('should forward to labelService', () => {
        const entity = { id: 4199 };
        const entity2 = { id: 7351 };
        jest.spyOn(labelService, 'compareLabel');
        comp.compareLabel(entity, entity2);
        expect(labelService.compareLabel).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareProject', () => {
      it('should forward to projectService', () => {
        const entity = { id: 10300 };
        const entity2 = { id: 3319 };
        jest.spyOn(projectService, 'compareProject');
        comp.compareProject(entity, entity2);
        expect(projectService.compareProject).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
