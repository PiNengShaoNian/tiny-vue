import { h } from '../../lib/tiny-vue.esm.js'

export const Child = {
  setup() {
    return {}
  },
  render() {
    console.log('render')
    return h('p', {}, 'Child msg:  ' + this.msg)
  },
}
