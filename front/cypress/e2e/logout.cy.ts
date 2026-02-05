describe('Logout spec', () => {
  
  it('should logout successfully', () => {
    cy.visit('/login')

    // Mock login API - EXACTEMENT comme dans login.cy.ts
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Yoga',
        lastName: 'Studio',
        admin: true
      },
    })

    // Mock sessions API - EXACTEMENT comme dans login.cy.ts
    cy.intercept({
      method: 'GET',
      url: '/api/session',
    }, []).as('session')

    // Se connecter
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    cy.url().should('include', '/sessions')

    // Vérifier que Logout est visible
    cy.contains('Logout').should('be.visible')
    
    // Cliquer sur Logout
    cy.contains('Logout').click()
    
    // Vérifier la redirection vers la page d'accueil
    cy.url().should('eq', 'http://localhost:4200/')
    
    // Vérifier que Login est visible (utilisateur déconnecté)
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
    
    // Vérifier que le token a été supprimé du localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
  })
})