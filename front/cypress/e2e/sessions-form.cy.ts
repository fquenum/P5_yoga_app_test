describe('Create Session spec', () => {

  // Test accessible uniquement aux admins
  describe('As an admin', () => {
    beforeEach(() => {
      // Login en tant qu'admin
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          token: 'fake-admin-token',
          type: 'Bearer',
          id: 1,
          username: 'admin@studio.com',
          firstName: 'Admin',
          lastName: 'User',
          admin: true
        },
      })

      cy.intercept('GET', '/api/session', []).as('sessions')

      cy.get('input[formControlName=email]').type("admin@studio.com")
      cy.get('input[formControlName=password]').type("test!1234{enter}")

      cy.url().should('include', '/sessions')
    })

    it('should display create session form', () => {
      // Mock de la liste des teachers
      cy.intercept('GET', '/api/teacher', [
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

      // Naviguer vers la page de création
      cy.visit('/sessions/create')

      cy.wait('@teachers')

      // Vérifier le titre
      cy.get('h1').should('contain', 'Create session')

      // Vérifier la présence des champs
      cy.get('input[formControlName=name]').should('be.visible')
      cy.get('input[formControlName=date]').should('be.visible')
      cy.get('mat-select[formControlName=teacher_id]').should('be.visible')
      cy.get('textarea[formControlName=description]').should('be.visible')

      // Vérifier que le bouton Save est désactivé au départ
      cy.contains('button', 'Save').should('be.disabled')
    })

    it('should create a session successfully', () => {
      cy.intercept('GET', '/api/teacher', [
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

      cy.intercept('GET', '/api/session', []).as('sessionsAfterCreate')

      cy.visit('/sessions/create')

      // Remplir le formulaire
      cy.get('input[formControlName=name]').type('New Yoga Session')
      cy.get('input[formControlName=date]').type('2024-12-25')
      
      // Sélectionner un teacher
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').contains('Margot Delahaye').click()
      
      cy.get('textarea[formControlName=description]').type('A wonderful Christmas yoga session')

      // Le bouton Save devrait être activé
      cy.contains('button', 'Save').should('not.be.disabled')

      // Soumettre le formulaire
      cy.contains('button', 'Save').click()

      cy.wait('@createSession')

      // Vérifier le snackbar
      cy.contains('Session created !').should('be.visible')

      // Vérifier la redirection vers /sessions
      cy.url().should('include', '/sessions')
    })

    it('should disable Save button when form is invalid', () => {
      cy.intercept('GET', '/api/teacher', [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.visit('/sessions/create')

      // Remplir seulement quelques champs
      cy.get('input[formControlName=name]').type('Incomplete Session')

      // Le bouton Save devrait rester désactivé
      cy.contains('button', 'Save').should('be.disabled')
    })

    it('should validate required fields', () => {
      cy.intercept('GET', '/api/teacher', [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.visit('/sessions/create')

      // Tenter de soumettre sans remplir
      cy.contains('button', 'Save').should('be.disabled')

      // Remplir tous les champs sauf description
      cy.get('input[formControlName=name]').type('Test Session')
      cy.get('input[formControlName=date]').type('2024-12-25')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').first().click()

      // Toujours désactivé sans description
      cy.contains('button', 'Save').should('be.disabled')

      // Ajouter la description
      cy.get('textarea[formControlName=description]').type('Test description')

      // Maintenant le bouton devrait être activé
      cy.contains('button', 'Save').should('not.be.disabled')
    })

    it('should validate description max length (2000 characters)', () => {
      cy.intercept('GET', '/api/teacher', [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.visit('/sessions/create')

      // Remplir les champs obligatoires
      cy.get('input[formControlName=name]').type('Test Session')
      cy.get('input[formControlName=date]').type('2024-12-25')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').first().click()

      // Créer une description de plus de 2000 caractères
      const longDescription = 'a'.repeat(2001)
      cy.get('textarea[formControlName=description]').type(longDescription.substring(0, 2001))

      // Le bouton Save devrait être désactivé
      cy.contains('button', 'Save').should('be.disabled')
    })

    it('should navigate back to sessions list when clicking back button', () => {
      cy.intercept('GET', '/api/teacher', [
        {
          id: 1,
          firstName: 'Margot',
          lastName: 'Delahaye'
        }
      ])

      cy.visit('/sessions/create')

      // Cliquer sur le bouton back
      cy.get('button[routerLink="/sessions"]').click()

      // Vérifier la navigation
      cy.url().should('include', '/sessions')
    })

    it('should load all teachers in the select dropdown', () => {
      cy.intercept('GET', '/api/teacher', [
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

      cy.visit('/sessions/create')

      cy.wait('@teachers')

      // Ouvrir le select
      cy.get('mat-select[formControlName=teacher_id]').click()

      // Vérifier que les 3 teachers sont présents
      cy.get('mat-option').should('have.length', 3)
      cy.get('mat-option').eq(0).should('contain', 'Margot Delahaye')
      cy.get('mat-option').eq(1).should('contain', 'Hélène Thiercelin')
      cy.get('mat-option').eq(2).should('contain', 'Jean Dupont')
    })
  })

  // Test pour utilisateur non-admin
  describe('As a regular user', () => {
    it('should redirect to sessions list if user is not admin', () => {
      cy.visit('/login')

      cy.intercept('POST', '/api/auth/login', {
        body: {
          token: 'fake-token',
          type: 'Bearer',
          id: 2,
          username: 'user@studio.com',
          firstName: 'User',
          lastName: 'Test',
          admin: false
        },
      })

      cy.intercept('GET', '/api/session', []).as('sessions')

      cy.get('input[formControlName=email]').type("user@studio.com")
      cy.get('input[formControlName=password]').type("test!1234{enter}")

      // Essayer d'accéder à la page de création
      cy.visit('/sessions/create')

      // Devrait être redirigé vers /sessions
      cy.url().should('include', '/sessions')
      cy.url().should('not.include', '/create')
    })
  })
})