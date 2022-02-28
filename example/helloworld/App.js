import { h } from '../../lib/tiny-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  render() {
    window.appInstance = this
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
    return {
      msg: 'tiny-vue!!!',
    }
  },
}
