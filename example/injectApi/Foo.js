import { h, inject, provide } from '../../lib/tiny-vue.esm.js'
import { Bar } from './Bar.js'

export const Foo = {
  setup(props, { emit }) {
    provide('foo', 'fooVal from ParentCompoent `Foo`')
    const barVal = inject('bar')
    const fooVal = inject('foo')
    return {
      handleClick() {
        emit('click', props)
        console.log('clicked')
      },
      fooVal,
      barVal,
    }
  },
  render() {
    return h('div', {}, [
      h('p', {}, `foo: ${this.fooVal} bar: ${this.barVal}`),
      h(Bar),
    ])
  },
}
