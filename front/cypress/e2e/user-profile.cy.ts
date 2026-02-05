describe('User Profile (Me) spec', () => {
  type SessionInfo = {
    id: number
    username: string
    firstName: string
    lastName: string
    admin: boolean
  }

  const regularSession: SessionInfo = {
    id: 1,
    username: 'user@studio.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
  }

  const adminSession: SessionInfo = {
    id: 2,
    username: 'admin@studio.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true,
  }

  const interceptSession = (session: SessionInfo) => {
    // Login response
    cy.intercept('POST', '/api/auth/login', { body: session }).as('login')

    // ✅ IMPORTANT:
    // MeComponent calls: this.sessionService.sessionInformation!.id
    // If /api/session returns [], sessionInformation is undefined and /me often redirects / fails to render.
    cy.intercept('GET', '/api/session', { statusCode: 200, body: session }).as('session')
  }

  const doLogin = (email: string, password = 'test!1234') => {
    cy.visit('/login')
    cy.get('input[formControlName=email]').clear().type(email)
    cy.get('input[formControlName=password]').clear().type(`${password}{enter}{enter}`)
    cy.wait('@login')
    cy.wait('@session')
    cy.url().should('include', '/sessions')
  }

  const mockUser = (id: number, body: any) => {
    cy.intercept('GET', `/api/user/${id}`, { statusCode: 200, body }).as('getUser')
  }

  describe('As a regular user', () => {
    beforeEach(() => {
      interceptSession(regularSession)
      doLogin('user@studio.com')
    })

    it('should display user information', () => {
      mockUser(1, {
        id: 1,
        email: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-15T00:00:00',
      })

      cy.contains('span.link', 'Account').click()
      cy.wait('@getUser')

      cy.get('h1').should('contain', 'User information')
      cy.contains('Name: John DOE').should('be.visible')
      cy.contains('Email: user@studio.com').should('be.visible')
      cy.contains('Create at:').should('be.visible')
      cy.contains('January 1, 2024').should('be.visible')
      cy.contains('Last update:').should('be.visible')
      cy.contains('January 15, 2024').should('be.visible')
    })

    it('should NOT display admin badge for regular user', () => {
      mockUser(1, {
        id: 1,
        email: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      })

      cy.visit('/me')
      cy.wait('@getUser')

      cy.contains('You are admin').should('not.exist')
    })

    it('should display delete account button for regular user', () => {
      mockUser(1, {
        id: 1,
        email: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      })

      cy.visit('/me')
      cy.wait('@getUser')

      cy.contains('Delete my account:').should('be.visible')
      cy.get('button[color="warn"]').should('be.visible')
    })

    it('should delete account successfully', () => {
      mockUser(1, {
        id: 1,
        email: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      })

      cy.intercept('DELETE', '/api/user/1', { statusCode: 200 }).as('deleteUser')

      cy.visit('/me')
      cy.wait('@getUser')

      cy.get('button[color="warn"]').click()
      cy.wait('@deleteUser')

      cy.contains('Your account has been deleted !').should('be.visible')
      cy.url().should('eq', 'http://localhost:4200/')
      cy.contains('Login').should('be.visible')
      cy.contains('Register').should('be.visible')
    })

    it('should navigate back when clicking back button', () => {
      mockUser(1, {
        id: 1,
        email: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      })

      cy.visit('/me')
      cy.wait('@getUser')

      // Matches me.component.html: <button mat-icon-button> <mat-icon>arrow_back</mat-icon>
      cy.contains('mat-icon', 'arrow_back').parent('button').click()

      cy.url().should('include', '/sessions')
    })
  })

  describe('As an admin', () => {
    beforeEach(() => {
      interceptSession(adminSession)
      doLogin('admin@studio.com')
    })

    it('should display admin badge', () => {
      mockUser(2, {
        id: 2,
        email: 'admin@studio.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      })

      cy.visit('/me')
      cy.wait('@getUser')

      cy.contains('You are admin').should('be.visible')
    })

    it('should NOT display delete account button for admin', () => {
      mockUser(2, {
        id: 2,
        email: 'admin@studio.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      })

      cy.visit('/me')
      cy.wait('@getUser')

      cy.contains('Delete my account:').should('not.exist')
      cy.get('button[color="warn"]').should('not.exist')
    })

    it('should display all admin information correctly', () => {
      mockUser(2, {
        id: 2,
        email: 'admin@studio.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true,
        createdAt: '2023-06-01T00:00:00',
        updatedAt: '2024-02-01T00:00:00',
      })

      cy.visit('/me')
      cy.wait('@getUser')

      cy.contains('Name: Admin USER').should('be.visible')
      cy.contains('Email: admin@studio.com').should('be.visible')
      cy.contains('You are admin').should('be.visible')
      cy.contains('June 1, 2023').should('be.visible')
      cy.contains('February 1, 2024').should('be.visible')
    })
  })

  describe('Direct access to /me route', () => {
    it('should load user profile when accessing /me directly', () => {
      interceptSession(regularSession)
      doLogin('user@studio.com')

      mockUser(1, {
        id: 1,
        email: 'user@studio.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      })

      cy.visit('/me')
      cy.wait('@getUser')

      cy.get('h1').should('contain', 'User information')
      cy.contains('Name: John DOE').should('be.visible')
    })
  })
})
