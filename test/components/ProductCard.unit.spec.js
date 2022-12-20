import { mount } from '@vue/test-utils'
import { makeServer } from '@/miragejs/server'
import ProductCard from '@/components/ProductCard'
import { CartManager } from '@/managers/CartManager'

const mountProductCard = () => {
  const product = server.create('product', {
    title: 'Relogio bonito',
    price: '23.00',
    image:
      'https://images.unsplash.com/photo-1495856458515-0637185db551?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
  })

  const cartManager = new CartManager()
  const wrapper = mount(ProductCard, {
    propsData: {
      product,
    },
    mocks: {
      $cart: cartManager,
    },
  })

  return { wrapper, product, cartManager }
}

describe('Product - Unit', () => {
  let server = null
  beforeEach(() => {
    server = makeServer({ environment: 'test' })
  })
  afterEach(() => {
    server.shutdown()
  })

  it('should mount the component ', () => {
    const { wrapper } = mountProductCard()
    expect(wrapper.vm).toBeDefined()
    expect(wrapper.text()).toContain('Relogio bonito')
    expect(wrapper.text()).toContain('$23.00')
  })

  it('should match snapshop', () => {
    const { wrapper } = mountProductCard()
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should add item to cartState on button click', async () => {
    const { wrapper, product, cartManager } = mountProductCard()
    const spy1 = jest.spyOn(cartManager, 'open')
    const spy2 = jest.spyOn(cartManager, 'addProduct')

    await wrapper.find('button').trigger('click')

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(product)
  })
})
