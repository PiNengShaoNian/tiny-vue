import { h } from '../../lib/tiny-vue.esm.js'

export const Foo = {
  setup(props, { emit }) {
    console.log(props)
    ++props.count

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
