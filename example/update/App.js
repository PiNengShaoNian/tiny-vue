import { h, ref } from '../../lib/tiny-vue.esm.js'

export const App = {
  render() {
    return h('div', {}, [
      h('p', { class: 'red' }, 'count: ' + this.count),
      h(
        'button',
        {
          class: 'blue',
          onClick: this.incrment,
        },
        'incr'
      ),
    ])
  },
  setup() {
    const count = ref(0)

    const incrment = () => {
      count.value++
    }
    return {
      count,
      incrment,
    }
  },
}
