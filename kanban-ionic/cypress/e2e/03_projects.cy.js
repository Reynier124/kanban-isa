describe('Test 3: Gestión de Proyectos', () => {
  let projectName;

  beforeEach(() => {
    projectName = `Proyecto Cypress ${Date.now()}`;
    cy.visit('/');
    cy.get('[data-cy="loginUsername"]').type('admin');
    cy.get('[data-cy="loginPassword"]').type('admin');
    cy.get('[data-cy="loginSubmit"]').click();
    cy.get('[data-cy="kanbanBoard"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="projectsViewBtn"]').click();
    cy.get('[data-cy="projectsBoard"]').should('be.visible');
  });

  afterEach(() => {
    // Cerrar cualquier modal/alert que pueda estar abierto
    cy.get('body').then($body => {
      if ($body.find('ion-backdrop').length > 0) {
        cy.get('[data-cy="modalCloseBtn"]').click({ force: true });
      }
    });
    // Eliminar el proyecto via UI si existe
    cy.get('[data-cy="projectsBoard"]').then($board => {
      const editedName = projectName.replace('Cypress', 'Editado');
      [projectName, editedName].forEach(name => {
        if ($board.text().includes(name)) {
          cy.get('[data-cy="projectsBoard"]')
            .contains(name)
            .parents('.project-card')
            .find('[data-cy="deleteProjectBtn"]')
            .click({ force: true });
        }
      });
    });
  });

  it('debe crear un proyecto y verlo en la lista', () => {
    cy.intercept('POST', '**/api/projects').as('createProject');

    cy.get('[data-cy="createProjectBtn"]').click();
    cy.get('[data-cy="modal"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="projectForm"]').should('be.visible');

    cy.get('[data-cy="projectName"]').type(projectName);
    cy.get('[data-cy="projectDescription"]').type('Proyecto creado por Cypress');
    cy.get('[data-cy="saveProjectBtn"]').click();

    cy.wait('@createProject').then(({ response }) => {
      expect(response.statusCode).to.equal(201);
    });

    cy.get('[data-cy="projectsBoard"]', { timeout: 8000 }).should('contain', projectName);
  });

  it('debe editar un proyecto existente', () => {
    const editedName = projectName.replace('Cypress', 'Editado');

    // Crear via UI
    cy.intercept('POST', '**/api/projects').as('createProject');
    cy.get('[data-cy="createProjectBtn"]').click();
    cy.get('[data-cy="modal"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="projectName"]').type(projectName);
    cy.get('[data-cy="projectDescription"]').type('Descripción original');
    cy.get('[data-cy="saveProjectBtn"]').click();
    cy.wait('@createProject');
    cy.get('[data-cy="projectsBoard"]', { timeout: 8000 }).should('contain', projectName);

    // Editar
    cy.intercept('PUT', '**/api/projects/**').as('updateProject');
    cy.get('[data-cy="projectsBoard"]')
      .contains(projectName)
      .parents('.project-card')
      .find('[data-cy="editProjectBtn"]')
      .click();

    cy.get('[data-cy="modal"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="projectName"]').clear().type(editedName);
    cy.get('[data-cy="saveProjectBtn"]').click();

    cy.wait('@updateProject').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });

    cy.get('[data-cy="projectsBoard"]', { timeout: 8000 }).should('contain', editedName);
    cy.get('[data-cy="projectsBoard"]').should('not.contain', projectName);
  });
});
