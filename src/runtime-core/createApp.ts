import { Component, createVNode } from './vnode'
import { render } from './renderer'

type App = {
  mount(rootContainer: HTMLElement): void
}

export const createApp = (rootComponent: Component): App => {
  return {
    mount(rootContainer) {
      const vnode = createVNode(rootComponent)
      render(vnode, rootContainer)
    },
  }
}
