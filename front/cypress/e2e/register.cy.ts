describe('Register spec', () => {
  it('should register successfully', () => {
    cy.visit('/register')

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        message: 'User registered successfully!'
      },
    }).as('registerRequest')

    // Remplir le formulaire avec des données valides
    cy.get('input[formControlName=firstName]').type("John")
    cy.get('input[formControlName=lastName]').type("Doe")
    cy.get('input[formControlName=email]').type("john.doe@test.com")
    cy.get('input[formControlName=password]').type("password123{enter}")

    // Attendre que la requête soit effectuée
    cy.wait('@registerRequest')

    // Vérifier la redirection vers login
    cy.url().should('include', '/login')
  })

  it('should display error when email already exists', () => {
    cy.visit('/register')

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        message: 'Error: Email is already taken!'
      },
    }).as('registerRequest')

    cy.get('input[formControlName=firstName]').type("John")
    cy.get('input[formControlName=lastName]').type("Doe")
    cy.get('input[formControlName=email]').type("existing@test.com")
    cy.get('input[formControlName=password]').type("password123{enter}")

    cy.wait('@registerRequest')

    // Vérifier l'affichage du message d'erreur
    cy.get('.error').should('be.visible')
  })

  it('should display error with invalid email format', () => {
    cy.visit('/register')

    // Remplir avec un email invalide
    cy.get('input[formControlName=firstName]').type("John")
    cy.get('input[formControlName=lastName]').type("Doe")
    cy.get('input[formControlName=email]').type("invalid-email")
    cy.get('input[formControlName=password]').type("password123")

    // Le bouton submit devrait être désactivé
    cy.get('button[type=submit]').should('be.disabled')
  })

  it('should display error with password too short', () => {
    cy.visit('/register')

    cy.get('input[formControlName=firstName]').type("John")
    cy.get('input[formControlName=lastName]').type("Doe")
    cy.get('input[formControlName=email]').type("john@test.com")
    cy.get('input[formControlName=password]').type("12345") // moins de 6 caractères

    // Le bouton submit devrait être désactivé
    cy.get('button[type=submit]').should('be.disabled')
  })

  it('should display error with firstName too short', () => {
    cy.visit('/register')

    cy.get('input[formControlName=firstName]').type("Jo") // moins de 3 caractères
    cy.get('input[formControlName=lastName]').type("Doe")
    cy.get('input[formControlName=email]').type("john@test.com")
    cy.get('input[formControlName=password]').type("password123")

    // Le bouton submit devrait être désactivé
    cy.get('button[type=submit]').should('be.disabled')
  })

  it('should display error with empty fields', () => {
    cy.visit('/register')

    // Essayer de soumettre sans remplir
    cy.get('button[type=submit]').should('be.disabled')
  })
})