import { h, getCurrentInstance } from '../../lib/tiny-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    return h('div', { id: 'root', class: ['red', 'black'] }, [
      h('p', { class: 'red' }, 'hi, '),
      h(
        'p',
        {
          class: 'blue',
          onClick() {
            console.log(this)
          },
          onMousedown() {
            console.log('mousedown')
          },
        },
        this.msg
      ),
      h(Foo, {
        count: 3,
        onClick(v) {
          console.log(`arguments from Foo`, v)
        },
      }),
    ])
  },
  setup() {
    const instance = getCurrentInstance()

    console.log(instance, 'App')
    return {
      msg: 'tiny-vue!!!',
    }
  },
}
