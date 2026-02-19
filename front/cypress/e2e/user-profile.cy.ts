describe('User Profile (Me) spec', () => {

  describe('As a regular user', () => {
    beforeEach(() => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'user@studio.com',
          firstName: 'John',
          lastName: 'Doe',
          admin: false
        },
      })

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [])

      cy.get('input[formControlName=email]').type("user@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')
    })

    it('should display user information', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/user/1',
      }, {
        id: 1,
        email: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-15T00:00:00'
      })

      cy.contains('span.link', 'Account').click()

      cy.get('h1').should('contain', 'User information')
      cy.contains('Name: John DOE').should('be.visible')
      cy.contains('Email: user@studio.com').should('be.visible')
      cy.contains('Create at:').should('be.visible')
      cy.contains('January 1, 2024').should('be.visible')
      cy.contains('Last update:').should('be.visible')
      cy.contains('January 15, 2024').should('be.visible')
    })

    it('should NOT display admin badge for regular user', () => {
      cy.intercept({
    method: 'GET',
    url: '/api/user/1',
  }, {
    id: 1,
    email: 'user@studio.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  })

  cy.contains('span.link', 'Account').click()

  cy.contains('You are admin').should('not.exist')
    })

    it('should delete account successfully', () => {
      cy.intercept({
    method: 'GET',
    url: '/api/user/1',
  }, {
    id: 1,
    email: 'user@studio.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  })

  cy.intercept('DELETE', '/api/user/1', {
    statusCode: 200
  })

  cy.contains('span.link', 'Account').click()

  cy.get('button[color="warn"]').click()

  cy.contains('Your account has been deleted !').should('be.visible')
  cy.url().should('eq', 'http://localhost:4200/')
  cy.contains('Login').should('be.visible')
  cy.contains('Register').should('be.visible')
    })

    it('should navigate back when clicking back button', () => {
      cy.intercept({
    method: 'GET',
    url: '/api/user/1',
  }, {
    id: 1,
    email: 'user@studio.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  })

  cy.contains('span.link', 'Account').click()

  cy.get('button mat-icon').contains('arrow_back').parent().click()

  cy.url().should('include', '/sessions')
    })
  })

  describe('As an admin', () => {
    beforeEach(() => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 2,
          username: 'admin@studio.com',
          firstName: 'Admin',
          lastName: 'User',
          admin: true
        },
      })

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [])

      cy.get('input[formControlName=email]').type("admin@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')
    })

    it('should display admin badge', () => {
     cy.intercept({
    method: 'GET',
    url: '/api/user/2',
  }, {
    id: 2,
    email: 'admin@studio.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  })

  cy.contains('span.link', 'Account').click()

  cy.contains('You are admin').should('be.visible')
    })

    it('should NOT display delete account button for admin', () => {
      cy.intercept({
    method: 'GET',
    url: '/api/user/2',
  }, {
    id: 2,
    email: 'admin@studio.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  })

  cy.contains('span.link', 'Account').click()

  cy.contains('Delete my account:').should('not.exist')
  cy.get('button[color="warn"]').should('not.exist')
    })

    it('should display all admin information correctly', () => {
      cy.intercept({
    method: 'GET',
    url: '/api/user/2',
  }, {
    id: 2,
    email: 'admin@studio.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true,
    createdAt: '2023-06-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00'
  })

  cy.contains('span.link', 'Account').click()

  cy.contains('Name: Admin USER').should('be.visible')
  cy.contains('Email: admin@studio.com').should('be.visible')
  cy.contains('You are admin').should('be.visible')
  cy.contains('June 1, 2023').should('be.visible')
  cy.contains('February 1, 2024').should('be.visible')
    })
  })

  describe('Direct access to /me route', () => {
    it('should load user profile when accessing /me directly', () => {
      cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      },
    })

    cy.intercept({
      method: 'GET',
      url: '/api/session',
    }, [])

    cy.get('input[formControlName=email]').type("user@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    cy.url().should('include', '/sessions')

    cy.intercept({
      method: 'GET',
      url: '/api/user/1',
    }, {
      id: 1,
      email: 'user@studio.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: false,
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    })

    // Cliquer sur Account au lieu de cy.visit('/me')
    cy.contains('span.link', 'Account').click()

    cy.get('h1').should('contain', 'User information')
    cy.contains('Name: John DOE').should('be.visible')
    })
  })
})