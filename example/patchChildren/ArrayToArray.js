import { h, ref } from '../../lib/tiny-vue.esm.js'

export const ArrayToArray = {
  setup() {
    const array1Visible = ref(true)

    const toggle = () => {
      array1Visible.value = false
    }

    return {
      array1Visible,
      toggle,
    }
  },
  render() {
    console.log('rerender')
    return h(
      'div',
      {
        class: ['red', 'black'],
        style: 'background: red;',
        onClick: this.toggle,
      },
      this.textChildrenVisible
        ? [h('p', {}, 'array children1'), h('p', {}, 'array children2-1')]
        : [h('p', {}, 'array children1'), h('p', {}, 'array children2')]
    )
  },
}
