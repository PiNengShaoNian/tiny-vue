import { h, ref } from '../../lib/tiny-vue.esm.js'
import { Child } from './Child.js'

export const App = {
  setup() {
    const msg = ref('123')

    const count = ref(1)

    const changeMsg = () => {
      msg.value = Math.random()
    }

    const changeCount = () => {
      count.value++
    }

    return {
      changeMsg,
      msg,
      count,
      changeCount,
    }
  },
  render() {
    return h('div', { id: 'root', class: ['red', 'black'] }, [
      h(
        'button',
        {
          onClick: this.changeMsg,
        },
        '改变msg'
      ),
      h(Child, {
        msg: this.msg,
      }),
      h(
        'button',
        {
          onClick: this.changeCount,
        },
        '改变count'
      ),
      h('p', {}, 'count: ' + this.count),
    ])
  },
}
