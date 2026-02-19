describe('Login spec', () => {
  it('Login successfull', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    })

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []).as('session')

    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    cy.url().should('include', '/sessions')
  })
  it('should fail login with wrong credentials', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Unauthorized'
      }
    })

    cy.get('input[formControlName=email]').type("wrong@email.com")
    cy.get('input[formControlName=password]').type("wrongpassword{enter}{enter}")

    // Vérifier qu'on reste sur la page de login
    cy.url().should('include', '/login')
    
    // Vérifier l'affichage d'une erreur
    cy.get('.error').should('be.visible')
  })

  it('should disable submit button with invalid email', () => {
    cy.visit('/login')

    cy.get('input[formControlName=email]').type("invalid-email")
    cy.get('input[formControlName=password]').type("test!1234")

    cy.get('button[type=submit]').should('be.disabled')
  })

  it('should disable submit button with empty fields', () => {
    cy.visit('/login')

    cy.get('button[type=submit]').should('be.disabled')
  })
});