import { h } from '../../lib/tiny-vue.esm.js'
import { ArrayToText } from './ArrayToText.js'
import { TextToArray } from './TextToArray.js'
import { TextToText } from './TextToText.js'
import { ArrayToArray } from './ArrayToArray.js'

export const App = {
  render() {
    return h(
      'div',
      { id: 'root', class: ['red', 'black'] },

      // [h(ArrayToText)]
      // [h(TextToText)]
      // [h(TextToArray)]
      [h(ArrayToArray)]
    )
  },
  setup() {
    return {}
  },
}
