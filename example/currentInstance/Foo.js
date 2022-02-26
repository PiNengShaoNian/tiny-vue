import { h, getCurrentInstance } from '../../lib/tiny-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup(props, { emit }) {
    const instance = getCurrentInstance()

    console.log(instance, 'Foo')
    return {
      handleClick() {
        emit('click', props)
        console.log('clicked')
      },
    }
  },
  render() {
    return h('div', {}, [
      'foo: ' + this.count,
      h('button', { onClick: this.handleClick }, 'button'),
    ])
  },
}
