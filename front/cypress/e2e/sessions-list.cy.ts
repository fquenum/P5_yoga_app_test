describe('Sessions List spec', () => {

  describe('As a regular user', () => {
    beforeEach(() => {
      cy.visit('/login')

      // Mock login API
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'user@studio.com',
          firstName: 'User',
          lastName: 'Test',
          admin: false
        },
      })

      // Mock sessions API
      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [
        {
          id: 1,
          name: 'Yoga Session 1',
          description: 'Description 1',
          date: '2024-02-10T10:00:00',
          teacher_id: 1,
          users: [1, 2],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: 2,
          name: 'Yoga Session 2',
          description: 'Description 2',
          date: '2024-02-11T14:00:00',
          teacher_id: 2,
          users: [1],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ]).as('session')

      cy.get('input[formControlName=email]').type("user@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')
    })

    it('should display list of sessions', () => {
      cy.get('.item').should('have.length', 2)
      cy.contains('Yoga Session 1').should('be.visible')
      cy.contains('Yoga Session 2').should('be.visible')
    })

    it('should NOT display Create button for regular user', () => {
      cy.get('button span').contains('Create').should('not.exist')
    })

    it('should NOT display Edit button for regular user', () => {
      cy.get('button span').contains('Edit').should('not.exist')
    })

    it('should display Detail button for all sessions', () => {
      // Vérifier qu'il y a 2 sessions
      cy.get('.item').should('have.length', 2)
      
      // Vérifier qu'il y a 2 boutons Detail (un par session)
      cy.get('button span.ml1').filter(':contains("Detail")').should('have.length', 2)
    })

    it('should navigate to session detail when clicking Detail', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'Yoga Session 1',
        description: 'Description 1',
        date: '2024-02-10T10:00:00',
        teacher_id: 1,
        users: [1, 2],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }).as('sessionDetail')

      cy.intercept({
        method: 'GET',
        url: '/api/teacher/1',
      }, {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }).as('teacher')

      // Cliquer sur le premier bouton Detail
      cy.get('button span').contains('Detail').first().click()
      
      cy.url().should('include', '/sessions/detail/1')
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
          lastName: 'Test',
          admin: true
        },
      })

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [
        {
          id: 1,
          name: 'Yoga Session 1',
          description: 'Description 1',
          date: '2024-02-10T10:00:00',
          teacher_id: 1,
          users: [1, 2],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ]).as('session')

      cy.get('input[formControlName=email]').type("admin@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')
    })

    it('should display Create button for admin', () => {
      cy.get('button span').contains('Create').should('be.visible')
    })

    it('should display Edit button for admin on each session', () => {
      cy.get('button span').contains('Edit').should('be.visible')
    })

    it('should navigate to create session when clicking Create', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ]).as('teachers')

      cy.get('button span').contains('Create').click()
      cy.url().should('include', '/sessions/create')
    })

    it('should navigate to update session when clicking Edit', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'Yoga Session 1',
        description: 'Description 1',
        date: '2024-02-10T10:00:00',
        teacher_id: 1,
        users: [1, 2],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }).as('sessionDetail')

      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ]).as('teachers')

      cy.get('button span').contains('Edit').first().click()
      cy.url().should('include', '/sessions/update/1')
    })
  })

  describe('Empty sessions list', () => {
    it('should display empty list when no sessions available', () => {
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

      cy.get('.item').should('have.length', 0)
    })
  })
})