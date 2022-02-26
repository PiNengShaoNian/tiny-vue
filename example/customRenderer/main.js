import { h, createRenderer } from '../../lib/tiny-vue.esm.js'

const game = new PIXI.Application({
  width: 500,
  height: 500,
})

document.body.append(game.view)

const renderer = createRenderer({
  createElement(type) {
    if (type === 'rect') {
      const rect = new PIXI.Graphics()
      rect.beginFill(0xff0000)
      rect.drawRect(0, 0, 100, 100)
      rect.endFill()

      return rect
    }
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, container) {
    container.addChild(el)
  },
  createText(text) {
    return document.createTextNode(text)
  },
  patchProp(el, key, val) {
    el[key] = val
  },
})

const App = {
  setup() {
    return {
      x: 100,
      y: 100,
    }
  },
  render() {
    const { x, y } = this
    return h('rect', { x, y })
  },
}

renderer.createApp(App).mount(game.stage)
