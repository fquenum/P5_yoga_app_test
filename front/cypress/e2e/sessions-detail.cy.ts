describe('Session Detail spec', () => {

  describe('As a regular user - not participating', () => {
    beforeEach(() => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'user@studio.com',
          firstName: 'User',
          lastName: 'Test',
          admin: false
        },
      })

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, []).as('session')

      cy.get('input[formControlName=email]').type("user@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')

      // ⚠️ Définir les intercepts ici AVANT chaque test
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'morning yoga',
        date: '2024-12-20T10:00:00',
        teacher_id: 1,
        description: 'A relaxing morning yoga session to start your day',
        users: [2, 3],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-15T00:00:00'
      }).as('sessionDetail')

      cy.intercept({
        method: 'GET',
        url: '/api/teacher/1',
      }, {
        id: 1,
        firstName: 'Margot',
        lastName: 'Delahaye',
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }).as('teacher')
    })

    it('should display session details', () => {
      cy.visit('/sessions/detail/1')

      cy.get('h1').should('contain', 'Morning Yoga')
      cy.contains('Margot DELAHAYE').should('be.visible')
      cy.contains('2 attendees').should('be.visible')
      cy.contains('December 20, 2024').should('be.visible')
      cy.get('.description').should('contain', 'A relaxing morning yoga session to start your day')
    })

    it('should display Participate button when user is not participating', () => {
      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Participate').should('be.visible')
      cy.get('button span.ml1').contains('Do not participate').should('not.exist')
    })

    it('should NOT display Delete button for regular user', () => {
      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Delete').should('not.exist')
    })

    it('should participate in session', () => {
      cy.intercept('POST', '/api/session/1/participate/1', {})

      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Participate').should('be.visible')

      // Redéfinir l'intercept pour la session APRÈS participation
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'morning yoga',
        date: '2024-12-20T10:00:00',
        teacher_id: 1,
        description: 'A relaxing morning yoga session',
        users: [1, 2, 3],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      })

      cy.get('button span.ml1').contains('Participate').click()

      cy.contains('3 attendees').should('be.visible')
      cy.get('button span.ml1').contains('Do not participate').should('be.visible')
    })
  })

  describe('As a regular user - already participating', () => {
    beforeEach(() => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'user@studio.com',
          firstName: 'User',
          lastName: 'Test',
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

      // Intercepts pour utilisateur DÉJÀ participant
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'morning yoga',
        date: '2024-12-20T10:00:00',
        teacher_id: 1,
        description: 'A relaxing morning yoga session',
        users: [1, 2, 3], // User 1 EST dans la liste
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      })

      cy.intercept({
        method: 'GET',
        url: '/api/teacher/1',
      }, {
        id: 1,
        firstName: 'Margot',
        lastName: 'Delahaye'
      })
    })

    it('should display "Do not participate" button when user is already participating', () => {
      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Do not participate').should('be.visible')
      cy.get('button span.ml1').contains('Participate').should('not.exist')
    })

    it('should unparticipate from session', () => {
      cy.intercept('DELETE', '/api/session/1/participate/1', {})

      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Do not participate').should('be.visible')

      // Redéfinir l'intercept APRÈS le clic
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'morning yoga',
        date: '2024-12-20T10:00:00',
        teacher_id: 1,
        description: 'A relaxing morning yoga session',
        users: [2, 3], // User 1 retiré
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      })

      cy.get('button span.ml1').contains('Do not participate').click()

      cy.contains('2 attendees').should('be.visible')
      cy.get('button span.ml1').contains('Participate').should('be.visible')
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

      // Intercepts pour admin
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'morning yoga',
        date: '2024-12-20T10:00:00',
        teacher_id: 1,
        description: 'A relaxing morning yoga session',
        users: [1, 2],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      })

      cy.intercept({
        method: 'GET',
        url: '/api/teacher/1',
      }, {
        id: 1,
        firstName: 'Margot',
        lastName: 'Delahaye'
      })
    })

    it('should display Delete button for admin', () => {
      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Delete').should('be.visible')
    })

    it('should NOT display Participate or Do not participate buttons for admin', () => {
      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Participate').should('not.exist')
      cy.get('button span.ml1').contains('Do not participate').should('not.exist')
    })

    it('should delete session and redirect to sessions list', () => {
      cy.intercept('DELETE', '/api/session/1', {})
      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [])

      cy.visit('/sessions/detail/1')

      cy.get('button span.ml1').contains('Delete').click()

      cy.contains('Session deleted !').should('be.visible')
      cy.url().should('include', '/sessions')
    })
  })

  describe('Back button', () => {
    it('should navigate back when clicking back button', () => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'user@studio.com',
          firstName: 'User',
          lastName: 'Test',
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
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'morning yoga',
        date: '2024-12-20T10:00:00',
        teacher_id: 1,
        description: 'A relaxing morning yoga session',
        users: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      })

      cy.intercept({
        method: 'GET',
        url: '/api/teacher/1',
      }, {
        id: 1,
        firstName: 'Margot',
        lastName: 'Delahaye'
      })

      cy.visit('/sessions/detail/1')

      // Cliquer sur le bouton avec l'icône arrow_back
      cy.get('button mat-icon').parent().click()

      cy.url().should('include', '/sessions')
    })
  })
})