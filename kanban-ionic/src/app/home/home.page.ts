import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonIcon, IonModal, IonSpinner, IonFab, IonFabButton,
  AlertController, ToastController
 } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, create, logOut, close, folder, list } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { IssueServiceTs, Issue, IssueStatus } from '../services/issue.service.ts';
import { ProjectService, Project } from '../services/project.service';

type ModalMode = 'issue' | 'project';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonIcon, IonModal, IonSpinner, IonFab, IonFabButton
  ],
})
export class HomePage implements OnInit {
  // Auth
  isLoggedIn = false;
  loginUsername = '';
  loginPassword = '';
  loginError = '';
  isLoggingIn = false;

  // Data
  issues: Issue[] = [];
  projects: Project[] = [];
  isLoading = false;

  // View
  activeView: 'kanban' | 'projects' = 'kanban';

  // Modal
  showModal = false;
  isEditing = false;
  modalMode: ModalMode = 'issue';
  currentIssue: Partial<Issue> = {};
  currentProject: Partial<Project> = {};

  get openIssues() { return this.issues.filter(i => i.status === 'OPEN'); }
  get inProgressIssues() { return this.issues.filter(i => i.status === 'IN_PROGRESS'); }
  get closedIssues() { return this.issues.filter(i => i.status === 'CLOSED'); }

  constructor(
    private auth: AuthService,
    private issueService: IssueServiceTs,
    private projectService: ProjectService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ add, trash, create, logOut, close, folder, list });
  }

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    if (this.isLoggedIn) this.loadAll();
  }

  login() {
    if (!this.loginUsername || !this.loginPassword) return;
    this.isLoggingIn = true;
    this.loginError = '';
    this.auth.login(this.loginUsername, this.loginPassword).subscribe({
      next: () => { this.isLoggedIn = true; this.isLoggingIn = false; this.loadAll(); },
      error: () => { this.loginError = 'Usuario o contraseña incorrectos'; this.isLoggingIn = false; }
    });
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
    this.issues = [];
    this.projects = [];
  }

  loadAll() {
    this.isLoading = true;
    this.issueService.getAll().subscribe({
      next: issues => { this.issues = issues; this.isLoading = false; },
      error: () => this.isLoading = false
    });
    this.projectService.getAll().subscribe({
      next: projects => this.projects = projects,
      error: () => {}
    });
  }

  openCreateIssue() {
    this.modalMode = 'issue';
    this.isEditing = false;
    this.currentIssue = { status: 'OPEN' };
    this.showModal = true;
  }

  openEditIssue(issue: Issue) {
    this.modalMode = 'issue';
    this.isEditing = true;
    this.currentIssue = { ...issue };
    this.showModal = true;
  }

  saveIssue() {
    if (!this.currentIssue.title?.trim()) return;
    const op = this.isEditing
      ? this.issueService.update(this.currentIssue as Issue)
      : this.issueService.create(this.currentIssue as Issue);
    op.subscribe({
      next: () => { this.showModal = false; this.loadAll(); this.showToast(this.isEditing ? 'Tarea actualizada ✓' : 'Tarea creada ✓'); },
      error: () => this.showToast('Error al guardar', 'danger')
    });
  }

  moveIssue(issue: Issue, status: IssueStatus) {
    this.issueService.update({ ...issue, status }).subscribe({
      next: () => this.loadAll(),
      error: () => this.showToast('Error al mover', 'danger')
    });
  }

  async confirmDeleteIssue(issue: Issue) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: `¿Eliminar "${issue.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.issueService.delete(issue.id!).subscribe({
            next: () => { this.loadAll(); this.showToast('Tarea eliminada'); },
            error: () => this.showToast('Error al eliminar', 'danger')
          });
        }}
      ]
    });
    await alert.present();
  }

  openCreateProject() {
    this.modalMode = 'project';
    this.isEditing = false;
    this.currentProject = {};
    this.showModal = true;
  }

  openEditProject(project: Project) {
    this.modalMode = 'project';
    this.isEditing = true;
    this.currentProject = { ...project };
    this.showModal = true;
  }

  saveProject() {
    if (!this.currentProject.name?.trim()) return;
    const op = this.isEditing
      ? this.projectService.update(this.currentProject as Project)
      : this.projectService.create(this.currentProject as Project);
    op.subscribe({
      next: () => { this.showModal = false; this.loadAll(); this.showToast(this.isEditing ? 'Proyecto actualizado ✓' : 'Proyecto creado ✓'); },
      error: () => this.showToast('Error al guardar', 'danger')
    });
  }

  async confirmDeleteProject(project: Project) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar proyecto',
      message: `¿Eliminar "${project.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.projectService.delete(project.id!).subscribe({
            next: () => { this.loadAll(); this.showToast('Proyecto eliminado'); },
            error: () => this.showToast('Error al eliminar', 'danger')
          });
        }}
      ]
    });
    await alert.present();
  }

  getProjectName(issue: Issue): string {
    return (issue.project as any)?.name || '';
  }

  async showToast(message: string, color = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }
}
