import { h, ref } from '../../lib/tiny-vue.esm.js'

export const TextToArray = {
  setup() {
    const textChildrenVisible = ref(true)

    const toggle = () => {
      textChildrenVisible.value = false
    }

    return {
      textChildrenVisible,
      toggle,
    }
  },
  render() {
    return h(
      'div',
      {
        class: ['red', 'black'],
        style: 'background: blue;',
        onClick: this.toggle,
      },
      this.textChildrenVisible
        ? 'text children'
        : [h('p', {}, 'array children1'), h('p', {}, 'array children2')]
    )
  },
}
