import { h, ref } from '../../lib/tiny-vue.esm.js'

export const ArrayToText = {
  setup() {
    const textChildrenVisible = ref(false)

    const toggle = () => {
      textChildrenVisible.value = true
    }

    return {
      textChildrenVisible,
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
        ? 'text children'
        : [h('p', {}, 'array children1'), h('p', {}, 'array children2')]
    )
  },
}
