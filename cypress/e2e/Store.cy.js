import { makeServer } from '../../miragejs/server'

context('Store', () => {
  let server
  beforeEach(() => {
    server = makeServer({ environment: 'test' })
  })
  afterEach(() => {
    server.shutdown()
  })

  it('should display the store', () => {
    cy.visit('http://localhost:3000')
    cy.get('body').contains('Brand')
    cy.get('body').contains('Wrist Watch')
  })

  context('Store > search for products', () => {
    it('should type in the search field', () => {
      cy.visit('http://localhost:3000')
      cy.get('input[type="search"]')
        .type('Some text here')
        .should('have.value', 'Some text here')
    })

    it('should return 1 product when "Relogio bonito" is used in search term', () => {
      server.create('product', { title: 'Relógio bonito' })
      server.createList('product', 10)

      cy.visit('http://localhost:3000')
      cy.get('input[type="search"]').type('Relógio bonito')
      cy.getByTestId('search-form').submit()
      cy.getByTestId('product-card').should('have.length', 1)
    })

    it('should not return any product', () => {
      server.createList('product', 10)

      cy.visit('http://localhost:3000')
      cy.get('input[type="search"]').type('Relógio bonito')
      cy.getByTestId('search-form').submit()
      cy.getByTestId('product-card').should('have.length', 0)
      cy.get('body').contains('0 Products')
    })
  })

  context('Store > Product List', () => {
    it('Should display "0 Products" when no product is returned', () => {
      cy.visit('http://localhost:3000')
      cy.getByTestId('product-card').should('have.length', 0)
    })

    it('Should display "1 Product" when no product is returned', () => {
      server.create('product')
      cy.visit('http://localhost:3000')
      cy.getByTestId('product-card').should('have.length', 1)
      cy.get('body').contains('1 Product')
    })

    it('Should display "10 Products" when no product is returned', () => {
      server.createList('product', 10)
      cy.visit('http://localhost:3000')
      cy.getByTestId('product-card').should('have.length', 10)
      cy.get('body').contains('10 Products')
    })
  })

  context('Store > ShoppingCart', () => {
    beforeEach(() => {
      server.createList('product', 10)
      cy.visit('http://localhost:3000')
    })
    it('Should not display shopping cart when page first load', () => {
      cy.getByTestId('shopping-cart').should('have.class', 'hidden')
    })

    it('Should toggle shopping cart visiting when button is clicked', () => {
      cy.getByTestId('toggle-button').as('toggleButton')
      cy.get('@toggleButton').click()
      cy.getByTestId('shopping-cart').should('not.have.class', 'hidden')

      cy.getByTestId('toggle-button').as('toggleButton')
      cy.get('@toggleButton').click({ force: true })
      cy.getByTestId('shopping-cart').should('have.class', 'hidden')
    })

    it('should have a message "Cart is empty" when are not product in cart', () => {
      cy.getByTestId('toggle-button').as('toggleButton')
      cy.get('@toggleButton').click()
      cy.getByTestId('shopping-cart').contains('Cart is empty')
    })

    it('should not display Clear cart button when cart is empty', () => {
      cy.getByTestId('toggle-button').as('toggleButton')
      cy.get('@toggleButton').click()
      cy.getByTestId('shopping-cart').as('shoppingCart')
      cy.get('@shoppingCart')
        .find('[data-testid="clear-cart-button"]')
        .should('not.exist')
    })

    it('should open the cart when item is added', () => {
      cy.getByTestId('product-card').first().find('button').click()
      cy.getByTestId('shopping-cart').should('not.have.class', 'hidden')
    })

    it('should add first product to the cart', () => {
      cy.addToCart({ index: 1 })
      cy.getByTestId('cart-item').should('have.length', 1)
    })

    it('should add 3 products to the cart', () => {
      cy.addToCart({ indexes: [1, 3, 5] })
      cy.getByTestId('cart-item').should('have.length', 3)
    })

    it('should add all products to the cart', () => {
      cy.addToCart({ indexes: 'all' })
      cy.getByTestId('cart-item').should('have.length', 10)
    })

    it('should remove a product from cart', () => {
      cy.addToCart({ index: 2 })
      cy.getByTestId('cart-item').as('cartItems')
      cy.get('@cartItems').should('have.length', 1)
      cy.get('@cartItems').first().find('[data-testid="remove-button"]').click()
      cy.get('@cartItems').should('have.length', 0)
    })

    it('should clear cart when "Clear Cart" product is clicked', () => {
      cy.addToCart({ indexes: [1, 2, 3] })
      cy.getByTestId('cart-item').should('have.length', 3)
      cy.getByTestId('clear-cart-button').click()
      cy.getByTestId('cart-item').should('have.length', 0)
    })
    it('should display quantity 1 when product is added to cart', () => {
      cy.addToCart({ index: 1 })
      cy.getByTestId('quantity').contains(1)
    })

    it('should increase quantity when button + gets clicked', () => {
      cy.addToCart({ index: 1 })
      cy.getByTestId('+').click()
      cy.getByTestId('quantity').contains(2)
      cy.getByTestId('+').click()
      cy.getByTestId('quantity').contains(3)
    })

    it('should decrease quantity when button - gets clicked', () => {
      cy.addToCart({ index: 1 })
      cy.getByTestId('+').click()
      cy.getByTestId('+').click()
      cy.getByTestId('quantity').contains(3)
      cy.getByTestId('-').click()
      cy.getByTestId('quantity').contains(2)
      cy.getByTestId('-').click()
      cy.getByTestId('quantity').contains(1)
    })

    it('should not decrease bellow zero when button - gets clicked', () => {
      cy.addToCart({ index: 1 })
      cy.getByTestId('quantity').contains(1)
    })
  })
})
