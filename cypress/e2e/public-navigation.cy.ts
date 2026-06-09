describe('Navegação Pública', () => {
  it('Visita a página principal', () => {
    cy.visit('/')
    cy.contains('Especialidades') // Assuming there's some text like this, or we can check the general rendering.
    // We will verify the logo or just ensure it loaded without errors.
    cy.get('.header').should('be.visible')
  })

  it('Navega para a página de Produtos', () => {
    cy.visit('/')
    // Acessa pelo menu
    cy.get('a[href="/produtos"]').first().click()
    cy.url().should('include', '/produtos')
    cy.get('.catalog-view').should('exist') // ou similar
  })

  it('Verifica o carregamento de páginas institucionais', () => {
    cy.visit('/sobre')
    cy.url().should('include', '/sobre')
    cy.contains('sobre', { matchCase: false })

    cy.visit('/localizacao')
    cy.url().should('include', '/localizacao')

    cy.visit('/contatos')
    cy.url().should('include', '/contatos')
  })
})
