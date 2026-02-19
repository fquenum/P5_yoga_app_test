describe('Create Session spec', () => {

  describe('As an admin', () => {
    beforeEach(() => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'admin@studio.com',
          firstName: 'Admin',
          lastName: 'User',
          admin: true
        },
      })

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, []).as('sessions')

      cy.get('input[formControlName=email]').type("admin@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')
    })

    it('should display create session form', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        },
        {
          id: 2,
          firstName: 'Hélène',
          lastName: 'Thiercelin',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]).as('teachers')

      cy.get('button span.ml1').contains('Create').click()

      cy.get('h1').should('contain', 'Create session')
      cy.get('input[formControlName=name]').should('be.visible')
      cy.get('input[formControlName=date]').should('be.visible')
      cy.get('mat-select[formControlName=teacher_id]').should('be.visible')
      cy.get('textarea[formControlName=description]').should('be.visible')
      cy.contains('button', 'Save').should('be.disabled')
    })

    it('should create a session successfully', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        },
        {
          id: 2,
          firstName: 'Hélène',
          lastName: 'Thiercelin',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ])

      cy.intercept('POST', '/api/session', {
        id: 1,
        name: 'New Yoga Session',
        date: '2024-12-25T10:00:00',
        teacher_id: 1,
        description: 'A wonderful Christmas yoga session',
        users: [],
        createdAt: '2024-12-01T00:00:00',
        updatedAt: '2024-12-01T00:00:00'
      }).as('createSession')

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, []).as('sessionsAfterCreate')

      cy.get('button span.ml1').contains('Create').click()

      cy.get('input[formControlName=name]').type('New Yoga Session')
      cy.get('input[formControlName=date]').type('2024-12-25')
      
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').contains('Margot Delahaye').click()
      
      cy.get('textarea[formControlName=description]').type('A wonderful Christmas yoga session')

      cy.contains('button', 'Save').should('not.be.disabled')
      cy.contains('button', 'Save').click()

      cy.contains('Session created !').should('be.visible')
      cy.url().should('include', '/sessions')
    })

    it('should disable Save button when form is invalid', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.get('button span.ml1').contains('Create').click()

      cy.get('input[formControlName=name]').type('Incomplete Session')
      cy.contains('button', 'Save').should('be.disabled')
    })

    it('should validate required fields', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.get('button span.ml1').contains('Create').click()

      cy.contains('button', 'Save').should('be.disabled')

      cy.get('input[formControlName=name]').type('Test Session')
      cy.get('input[formControlName=date]').type('2024-12-25')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').first().click()

      cy.contains('button', 'Save').should('be.disabled')

      cy.get('textarea[formControlName=description]').type('Test description')
      cy.contains('button', 'Save').should('not.be.disabled')
    })

    it('should validate description max length (2000 characters)', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.get('button span.ml1').contains('Create').click()

      cy.get('input[formControlName=name]').type('Test Session')
      cy.get('input[formControlName=date]').type('2024-12-25')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').first().click()

      const longDescription = 'a'.repeat(2001)
      cy.get('textarea[formControlName=description]').type(longDescription.substring(0, 2001))

      cy.contains('button', 'Save').should('be.disabled')
    })

    it('should navigate back to sessions list when clicking back button', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.get('button span.ml1').contains('Create').click()

      cy.get('button mat-icon').contains('arrow_back').parent().click()

      cy.url().should('include', '/sessions')
    })

    it('should load all teachers in the select dropdown', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        },
        {
          id: 2,
          firstName: 'Hélène',
          lastName: 'Thiercelin'
        },
        {
          id: 3,
          firstName: 'Jean',
          lastName: 'Dupont'
        }
      ]).as('teachers')

      cy.get('button span.ml1').contains('Create').click()

      cy.get('mat-select[formControlName=teacher_id]').click()

      cy.get('mat-option').should('have.length', 3)
      cy.get('mat-option').eq(0).should('contain', 'Margot Delahaye')
      cy.get('mat-option').eq(1).should('contain', 'Hélène Thiercelin')
      cy.get('mat-option').eq(2).should('contain', 'Jean Dupont')
    })
    
    it('should display error when session creation fails', () => {
  cy.intercept({
    method: 'GET',
    url: '/api/teacher',
  }, [
    {
      id: 1,
      firstName: 'Margot',
      lastName: 'Delahaye'
    }
  ])

  cy.intercept('POST', '/api/session', {
    statusCode: 500,
    body: {
      message: 'Internal Server Error'
    }
  }).as('createSessionError')

  cy.get('button span.ml1').contains('Create').click()

  cy.get('input[formControlName=name]').type('Test Session')
  cy.get('input[formControlName=date]').type('2024-12-25')
  cy.get('mat-select[formControlName=teacher_id]').click()
  cy.get('mat-option').first().click()
  cy.get('textarea[formControlName=description]').type('Test description')

  cy.contains('button', 'Save').click()

  cy.wait('@createSessionError')

  // Le test doit vérifier le comportement en cas d'erreur
  // (snackbar d'erreur, reste sur la page, etc.)
})
  })

  describe('As a regular user', () => {
    it('should not display Create button for regular user', () => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 2,
          username: 'user@studio.com',
          firstName: 'User',
          lastName: 'Test',
          admin: false
        },
      })

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [
        {
          id: 1,
          name: 'Test Session',
          description: 'Test',
          date: '2024-12-25T10:00:00',
          teacher_id: 1,
          users: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ])

      cy.get('input[formControlName=email]').type("user@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')

      cy.get('button span.ml1').contains('Create').should('not.exist')
    })
  })
})


describe('Update Session spec', () => {
  describe('As an admin', () => {
    beforeEach(() => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'admin@studio.com',
          firstName: 'Admin',
          lastName: 'User',
          admin: true
        },
      })

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [
        {
          id: 1,
          name: 'Existing Session',
          description: 'Old description',
          date: '2024-12-20T10:00:00',
          teacher_id: 1,
          users: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ]).as('sessions')

      cy.get('input[formControlName=email]').type("admin@studio.com")
      cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

      cy.url().should('include', '/sessions')
    })

    it('should update a session successfully', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/session/1',
      }, {
        id: 1,
        name: 'Existing Session',
        date: '2024-12-20',
        teacher_id: 1,
        description: 'Old description',
        users: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      })

      cy.intercept({
        method: 'GET',
        url: '/api/teacher',
      }, [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        },
        {
          id: 2,
          firstName: 'Hélène',
          lastName: 'Thiercelin'
        }
      ])

      cy.intercept('PUT', '/api/session/1', {
        id: 1,
        name: 'Updated Session',
        date: '2024-12-25T10:00:00',
        teacher_id: 2,
        description: 'New description',
        users: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-12-01T00:00:00'
      }).as('updateSession')

      cy.intercept({
        method: 'GET',
        url: '/api/session',
      }, [])

      // Cliquer sur Edit
      cy.get('button span.ml1').contains('Edit').first().click()

      // Vérifier que c'est bien le formulaire d'update
      cy.get('h1').should('contain', 'Update session')

      // Vérifier que les champs sont pré-remplis
      cy.get('input[formControlName=name]').should('have.value', 'Existing Session')
      cy.get('input[formControlName=date]').should('have.value', '2024-12-20')

      // Modifier les champs
      cy.get('input[formControlName=name]').clear().type('Updated Session')
      cy.get('input[formControlName=date]').clear().type('2024-12-25')
      
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').contains('Hélène Thiercelin').click()
      
      cy.get('textarea[formControlName=description]').clear().type('New description')

      cy.contains('button', 'Save').click()

      cy.wait('@updateSession')

      cy.contains('Session updated !').should('be.visible')
      cy.url().should('include', '/sessions')
    })
  })
})