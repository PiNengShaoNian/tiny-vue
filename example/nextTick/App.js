import { getCurrentInstance, h, ref, nextTick } from '../../lib/tiny-vue.esm.js'

export const App = {
  setup() {
    const count = ref(0)
    const instance = getCurrentInstance()

    const changeCount = () => {
      for (let i = 0; i < 100; ++i) {
        count.value++
      }
      console.log(instance.vnode.el?.textContent)
      nextTick(() => {
        console.log(instance.vnode.el?.textContent)
      })
    }

    return {
      changeCount,
      count,
    }
  },
  render() {
    return h('div', { id: 'root', class: ['red', 'black'] }, [
      h(
        'button',
        { class: 'red', onClick: this.changeCount },
        '加100, ' + this.count
      ),
    ])
  },
}
