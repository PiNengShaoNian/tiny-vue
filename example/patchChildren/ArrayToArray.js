import { h, ref } from '../../lib/tiny-vue.esm.js'

// 1. 左侧的对比
// (a b) c
// (a b) d e
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
// ]

// 2. 右侧的对比
//   a (b c)
// d e (b c)
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// const nextChildren = [
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// 3. 新的比老的长,多出来的节点在右边
// (a b)
// (a b) c
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]

// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// 4. 新的比老的长，多出来的节点在左边
//   (a b)
// c (a b)
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]

// const nextChildren = [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]

// 5. 新的比老的短，相同的节点在左边
// (a b) c
// (a b)
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]

// 6. 新的比老的短，相同节点在右边
// a (b c)
//   (b c)
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// const nextChildren = [
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C'),
// ]

// 7. 对比中间部分
// a b (c d) f g
// a b (e c) f g
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C', id: 'c-prev' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]

// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'C', id: 'c-next' }, 'C'),
//     h('p', { key: 'F' }, 'F'),
//     h('p', { key: 'G' }, 'G'),
// ]

// 7. 对比中间部分,位置交换
// a b (c d e f) g h
// a b (f c e d) g h
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C', id: 'c-prev' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
//   h('p', { key: 'H' }, 'H'),
// ]

// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'F' }, 'F'),
//     h('p', { key: 'C', id: 'c-next' }, 'C'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'G' }, 'G'),
//     h('p', { key: 'H' }, 'H'),
// ]

// 8. 综合例子
// a b (c d e z) f g
// a b (d c y e) f g
const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C', id: 'c-prev' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'Z' }, 'Z'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]

const nextChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'C', id: 'c-next' }, 'C'),
    h('p', { key: 'Y' }, 'Y'),
    h('p', { key: 'E' }, 'E'),
    h('p', { key: 'F' }, 'F'),
    h('p', { key: 'G' }, 'G'),
]

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
      this.array1Visible ? prevChildren : nextChildren
    )
  },
}
