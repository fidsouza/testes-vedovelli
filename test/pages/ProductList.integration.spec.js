import { mount } from '@vue/test-utils'
import ProductList from '@/pages/index'
import Search from '@/components/Search'
import ProductCard from '@/components/ProductCard'
import axios from 'axios'
import { makeServer } from '@/miragejs/server'
import Vue from 'vue'

jest.mock('axios', () => ({
  get: jest.fn(),
}))

describe('ProductList - integration', () => {
  let server = null
  beforeEach(() => {
    server = makeServer({ environment: 'test' })
  })
  afterEach(() => {
    server.shutdown()
    jest.clearAllMocks()
  })

  const getProducts = async (quantity = 10, overrides = []) => {
    let overridesList = []
    if (overrides.length > 0) {
      overridesList = overrides.map((override) =>
        server.create('product', override)
      )
    }
    const products = [
      ...server.createList('product', quantity),
      ...overridesList,
    ]

    return products
  }

  const mountProductList = async (
    quantity = 10,
    overrides = [],
    shouldReject = false
  ) => {
    const products = await getProducts(quantity, overrides)
    if (shouldReject) {
      await axios.get.mockReturnValue(
        Promise.reject(new Error('Problemas ao carregar a lista!'))
      )
    } else {
      await axios.get.mockReturnValue(Promise.resolve({ data: { products } }))
    }
    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    })
    await Vue.nextTick()

    return { wrapper, products }
  }

  it('should mount the component', async () => {
    const { wrapper } = await mountProductList()
    expect(wrapper.vm).toBeDefined()
  })
  it('should mount the Search component as a child', async () => {
    const { wrapper } = await mountProductList()
    expect(wrapper.findComponent(Search)).toBeDefined()
  })
  it('should call axios get on component mount', async () => {
    await mountProductList()
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('/api/products')
  })
  it('should mount the ProductCard component 10 times', async () => {
    const { wrapper } = await mountProductList()
    const cards = wrapper.findAllComponents(ProductCard)
    expect(cards).toHaveLength(10)
  })
  it('should the display error when promise rejected', async () => {
    const { wrapper } = await mountProductList(10, [], true)

    expect(wrapper.text()).toContain('Problemas ao carregar a lista!')
  })

  it('should filter the product list whan a search is performed', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'Meu relógio favorito',
      },
      { title: 'Meu outro relógio favorito' },
    ])

    const search = wrapper.findComponent(Search)
    await search.find('input[type="search"]').setValue('relógio')
    await search.find('form').trigger('submit')
    expect(wrapper.vm.searchTerm).toEqual('relógio')
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(2)
  })
  it('should filter the product list whan a search is performed', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'Meu relógio favorito',
      },
    ])

    const search = wrapper.findComponent(Search)
    await search.find('input[type="search"]').setValue('relógio')
    await search.find('form').trigger('submit')
    await search.find('input[type="search"]').setValue('')
    await search.find('form').trigger('submit')

    expect(wrapper.vm.searchTerm).toEqual('')
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(11)
  })

  it('should display the total quantity of products', async () => {
    const { wrapper } = await mountProductList(27)
    const label = wrapper.find('[data-testid="total-quantity-label"]')

    expect(label.text()).toEqual('27 Products')
  })
  it('should display product(singular) when there is only 1 product', async () => {
    const { wrapper } = await mountProductList(1)
    const label = wrapper.find('[data-testid="total-quantity-label"]')

    expect(label.text()).toEqual('1 Product')
  })
})
