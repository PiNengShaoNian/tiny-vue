import { h } from '../../lib/tiny-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  render() {
    return h('div', {}, [
      h('div', {}, 'App'),
      h(
        Foo,
        {},
        {
          header: () => [h('div', {}, '从APP传来的header')],
          footer: () => [h('div', {}, '从APP传来的footer')],
        }
      ),
    ])
  },
  setup() {
    return {}
  },
}
