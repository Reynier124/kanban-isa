describe('Test 2: Crear Issue y moverla entre columnas', () => {
  let issueName;

  beforeEach(() => {
    issueName = `Tarea Cypress ${Date.now()}`;
    cy.visit('/');
    cy.get('[data-cy="loginUsername"]').type('admin');
    cy.get('[data-cy="loginPassword"]').type('admin');
    cy.get('[data-cy="loginSubmit"]').click();
    cy.get('[data-cy="kanbanBoard"]', { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    // Cerrar cualquier modal/alert que pueda estar abierto
    cy.get('body').then($body => {
      if ($body.find('ion-backdrop').length > 0) {
        cy.get('[data-cy="modalCloseBtn"]').click({ force: true });
      }
    });
    // Eliminar la issue en cualquier columna donde esté
    ['colTodo', 'colProgress', 'colDone'].forEach(col => {
      cy.get(`[data-cy="${col}"]`).then($col => {
        if ($col.text().includes(issueName)) {
          cy.get(`[data-cy="${col}"]`)
            .contains(issueName)
            .parents('.issue-card')
            .find('[data-cy="deleteIssueBtn"]')
            .click({ force: true });
        }
      });
    });
  });

  it('debe crear una issue y aparecer en la columna POR HACER', () => {
    cy.intercept('POST', '**/api/issues').as('createIssue');

    cy.get('[data-cy="createIssueBtn"]').click();
    cy.get('[data-cy="modal"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="issueForm"]').should('be.visible');

    cy.get('[data-cy="issueTitle"]').type(issueName);
    cy.get('[data-cy="issueDescription"]').type('Descripción creada por Cypress');
    cy.get('[data-cy="issueStatus"]').select('OPEN');
    cy.get('[data-cy="saveIssueBtn"]').click();

    cy.wait('@createIssue').then(({ response }) => {
      expect(response.statusCode).to.equal(201);
    });

    cy.get('[data-cy="colTodo"]', { timeout: 8000 }).should('contain', issueName);
  });

  it('debe mover una issue de POR HACER a EN PROGRESO', () => {
    // Crear via UI
    cy.intercept('POST', '**/api/issues').as('createIssue');
    cy.get('[data-cy="createIssueBtn"]').click();
    cy.get('[data-cy="modal"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="issueTitle"]').type(issueName);
    cy.get('[data-cy="issueStatus"]').select('OPEN');
    cy.get('[data-cy="saveIssueBtn"]').click();
    cy.wait('@createIssue');
    cy.get('[data-cy="colTodo"]', { timeout: 8000 }).should('contain', issueName);

    // Mover a EN PROGRESO
    cy.intercept('PUT', '**/api/issues/**').as('updateIssue');
    cy.get('[data-cy="colTodo"]')
      .contains(issueName)
      .parents('.issue-card')
      .find('[data-cy="moveToProgressBtn"]')
      .click();

    cy.wait('@updateIssue').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });

    cy.get('[data-cy="colTodo"]').should('not.contain', issueName);
    cy.get('[data-cy="colProgress"]', { timeout: 8000 }).should('contain', issueName);
  });
});
