import { h, ref } from '../../lib/tiny-vue.esm.js'

export const TextToText = {
  setup() {
    const text1Visible = ref(true)

    const toggle = () => {
      text1Visible.value = false
    }

    return {
      text1Visible,
      toggle,
    }
  },
  render() {
    return h(
      'div',
      {
        class: ['red', 'black'],
        style: 'background: green;',
        onClick: this.toggle,
      },
      this.text1Visible ? 'text1' : 'text2'
    )
  },
}
