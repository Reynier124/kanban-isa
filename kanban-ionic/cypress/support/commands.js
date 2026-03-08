Cypress.Commands.add('loginViaAPI', (username = 'admin', password = 'admin') => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/authenticate`,
    body: { username, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('jwt', response.body.id_token);
    Cypress.env('token', response.body.id_token);
    return response.body;
  });
});

Cypress.Commands.add('authenticatedRequest', (method, url, body = null) => {
  const token = Cypress.env('token') || window.localStorage.getItem('jwt');
  const options = {
    method,
    url: `${Cypress.env('apiUrl')}${url}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = body;
  return cy.request(options);
});

Cypress.Commands.add('loginUI', (username = 'admin', password = 'admin') => {
  cy.visit('/');
  cy.get('[data-cy="loginUsername"]').type(username);
  cy.get('[data-cy="loginPassword"]').type(password);
  cy.get('[data-cy="loginSubmit"]').click();
  cy.get('[data-cy="kanbanBoard"]', { timeout: 10000 }).should('be.visible');
});
