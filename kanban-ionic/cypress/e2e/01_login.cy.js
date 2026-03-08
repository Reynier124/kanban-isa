describe('Test 1: Login', () => {
  it('debe mostrar la pantalla de login y permitir iniciar sesión', () => {
    cy.visit('/');

    // Verificar que aparece el formulario de login
    cy.get('[data-cy="loginUsername"]').should('be.visible');
    cy.get('[data-cy="loginPassword"]').should('be.visible');
    cy.get('[data-cy="loginSubmit"]').should('be.visible');

    // Intentar login con credenciales incorrectas
    cy.get('[data-cy="loginUsername"]').type('usuarioInvalido');
    cy.get('[data-cy="loginPassword"]').type('passwordInvalida');
    cy.get('[data-cy="loginSubmit"]').click();
    cy.get('[data-cy="loginError"]', { timeout: 8000 }).should('be.visible');

    // Limpiar y hacer login correcto
    cy.get('[data-cy="loginUsername"]').clear().type('admin');
    cy.get('[data-cy="loginPassword"]').clear().type('admin');
    cy.get('[data-cy="loginSubmit"]').click();

    // Verificar que el kanban es visible tras el login
    cy.get('[data-cy="kanbanBoard"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="colTodo"]').should('be.visible');
    cy.get('[data-cy="colProgress"]').should('be.visible');
    cy.get('[data-cy="colDone"]').should('be.visible');
  });
});
