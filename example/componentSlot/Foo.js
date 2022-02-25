import { h, renderSlot, createTextVNode } from '../../lib/tiny-vue.esm.js'

export const Foo = {
  setup(props) {
    return {}
  },
  render() {
    return h('p', {}, [
      renderSlot(this.$slots, 'header'),
      h('div', {}, '这个是中间'),
      createTextVNode('textVNode'),
      renderSlot(this.$slots, 'footer'),
    ])
  },
}
