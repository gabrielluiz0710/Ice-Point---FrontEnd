describe('Regras do Carrinho e Checkout', () => {
  beforeEach(() => {
    // Reset state before tests
    cy.visit('/')
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  it('Redireciona para o carrinho ao tentar acessar o checkout vazio', () => {
    // A regra no Vue Router diz: se < 80 itens, voltar pro carrinho
    cy.visit('/checkout')
    
    // Como a store inicia vazia, ele DEVE forçar um redirect para /carrinho
    cy.url().should('include', '/carrinho')
  })

  it('Impede o fluxo de compra de CEP fora de Uberaba no endereço (Mocked API)', () => {
    // Para testar isso, precisaríamos adicionar ao menos 80 itens no carrinho.
    // Como o front-end é isolado do cypress, podemos "injetar" os 80 itens na store,
    // ou apenas testar o mock de CEP diretamente caso consigamos montar o componente.
    
    // Uma forma de simular o state do carrinho no E2E é setar o localStorage
    // simulando a Pinia persistence, ou montar uma rota de debug.
    
    // Por enquanto, testaremos a regra vital de redirecionamento que o usuário pediu:
    cy.visit('/checkout')
    cy.url().should('include', '/carrinho')
    
    // Em um teste real ponta a ponta sem mock do banco:
    cy.visit('/produtos')
    // Clica no primeiro produto
    cy.get('.product-card').first().click()
    
    // Tenta adicionar 80 itens do produto
    cy.get('input[type="number"], .quantity-input').clear().type('80')
    cy.contains('button', 'Adicionar').click()
    
    // Agora o acesso ao checkout deve ser permitido
    cy.visit('/checkout')
    cy.url().should('include', '/checkout')
    
    // Teste de CEP (Viacep mockado SP)
    cy.intercept('GET', 'https://viacep.com.br/ws/01001000/json/', {
      statusCode: 200,
      body: {
        cep: "01001-000",
        logradouro: "Praça da Sé",
        complemento: "lado ímpar",
        bairro: "Sé",
        localidade: "São Paulo", // Isso vai acionar o bloqueio
        uf: "SP",
        ibge: "3550308",
        gia: "1004",
        ddd: "11",
        siafi: "7107"
      }
    }).as('viacepSP')

    cy.intercept('GET', 'https://viacep.com.br/ws/38000000/json/', {
      statusCode: 200,
      body: {
        cep: "38000-000",
        logradouro: "Rua Fictícia",
        complemento: "",
        bairro: "Centro",
        localidade: "Uberaba", 
        uf: "MG"
      }
    }).as('viacepUberaba')

    // Avança pro passo 2 (supondo que o step 1 de dados pessoais foi preenchido)
    // Para preencher, precisaríamos percorrer o form Pessoal:
    cy.get('input[name="fullName"]').type('João Testador')
    cy.get('input[name="email"]').type('joao@teste.com')
    cy.get('input[name="phone"]').type('34999999999')
    cy.get('input[name="cpf"]').type('12345678909')
    cy.get('input[name="birthDate"]').type('1990-01-01')
    cy.contains('button', 'Continuar').click()

    // Seleciona entrega
    cy.contains('button', 'Entregar no meu endereço').click()

    // Testa CEP SP
    cy.get('input[name="cep"]').type('01001-000')
    // Clica fora para acionar o blur
    cy.get('input[name="number"]').focus()
    cy.wait('@viacepSP')

    // Deve abrir o modal de erro de cidade
    cy.contains('Fora da Área de Entrega').should('be.visible')
    cy.contains('Entendi').click() // Fecha o modal

    // Testa CEP Uberaba
    cy.get('input[name="cep"]').clear().type('38000-000')
    cy.get('input[name="number"]').focus()
    cy.wait('@viacepUberaba')

    // O campo de logradouro deve ter preenchido Rua Fictícia e não deve ter modal
    cy.get('input[name="street"]').should('have.value', 'Rua Fictícia')
    cy.contains('Fora da Área de Entrega').should('not.exist')
  })
})
