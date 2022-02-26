import { h, ref } from '../../lib/tiny-vue.esm.js'

export const App = {
  setup() {
    const props = ref({
      foo: 'foo',
      bar: 'bar',
    })

    const setPropsToRandomValue = () => {
      props.value.foo = Math.random() + ''
    }

    const setPropsToNull = () => {
      props.value.foo = null
    }

    const deleteOneProperty = () => {
      props.value = {
        foo: 'foo',
      }
    }

    return {
      props,
      setPropsToNull,
      setPropsToRandomValue,
      deleteOneProperty,
    }
  },
  render() {
    return h('div', { ...this.props }, [
      h(
        'button',
        {
          class: 'blue',
          onClick: this.setPropsToRandomValue,
        },
        '设置新值'
      ),
      h(
        'button',
        {
          class: 'blue',
          onClick: this.setPropsToNull,
        },
        '设为null'
      ),
      h(
        'button',
        {
          class: 'blue',
          onClick: this.deleteOneProperty,
        },
        '删除一个属性'
      ),
    ])
  },
}
