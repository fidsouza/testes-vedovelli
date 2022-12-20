import Vue from 'vue'

export default {
  install: (Vue) => {
    Vue.prototype.$cart = new CartManager()
  },
}

const initialState = { open: false, items: [] }
export class CartManager {
  state

  constructor() {
    this.state = Vue.observable(initialState)
  }
  open() {
    this.state.open = true
    return this.getState()
  }
  close() {
    this.state.open = false
    return this.getState()
  }

  productisInTheCart(product) {
    return !!this.state.items.find(({ id }) => id === product.id)
  }

  addProduct(product) {
    if (!this.productisInTheCart(product)) {
      this.state.items.push(product)
    }
    return this.getState()
  }

  removeProduct(productId) {
    this.state.items = [
      ...this.state.items.filter((product) => product.id !== productId),
    ]

    return this.getState()
  }

  clearProducts() {
    this.state.items = []

    return this.getState()
  }

  clearCart() {
    this.clearProducts()
    this.close()

    return this.getState()
  }

  hasProducts() {
    return this.getState().items.length > 0
  }

  getState() {
    return this.state
  }
}
