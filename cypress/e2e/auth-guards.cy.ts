describe('Proteção de Rotas (Auth Guards)', () => {
  it('Redireciona para login ao tentar acessar /perfil deslogado', () => {
    cy.visit('/perfil')
    
    // A regra `userStore.isAuthenticated` será falsa, logo next({ name: 'login' })
    cy.url().should('include', '/login')
  })

  it('Redireciona para login ao tentar acessar áreas do Admin anonimamente', () => {
    cy.visit('/painel-controle')
    cy.url().should('include', '/login')
    
    cy.visit('/painel-controle/produtos')
    cy.url().should('include', '/login')
  })

  it('Permite o visitante acessar a página de login e cadastro livres', () => {
    cy.visit('/login')
    cy.get('.login-container, .auth-view').should('exist') // Seletores genéricos da sua view de auth
  })
})
