import { h } from '../../lib/tiny-vue.esm.js'

export const Foo = {
  setup(props) {
    console.log(props)
    ++props.count
  },
  render() {
    return h('div', {}, 'foo: ' + this.count)
  },
}
