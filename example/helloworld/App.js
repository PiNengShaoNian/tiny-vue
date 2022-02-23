import { h } from '../../lib/tiny-vue.esm.js'

export const App = {
  render() {
    return h('div', { id: 'root', class: ['red', 'black'] }, [
      h('p', { class: 'red' }, 'hi, '),
      h('p', { class: 'blue' }, 'tiny-vue'),
    ])
  },
  setup() {
    return {
      msg: 'tiny-vue',
    }
  },
}
