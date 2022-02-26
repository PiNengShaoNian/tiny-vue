import { h, inject } from '../../lib/tiny-vue.esm.js'

export const Bar = {
  setup() {
    const fooVal = inject('foo')
    const barVal = inject('bar')
    return {
      fooVal,
      barVal,
    }
  },
  render() {
    return h('div', {}, [
      h('div', {}, `foo: ${this.fooVal} bar: ${this.barVal}`),
    ])
  },
}
