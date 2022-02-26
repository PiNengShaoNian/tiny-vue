import { createRenderer } from '..'
import { Component } from '../runtime-core/vnode'

export const renderer = createRenderer<HTMLElement>({
  createElement(type) {
    return document.createElement(type)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, container) {
    container.appendChild(el)
  },
  createText(text) {
    return document.createTextNode(text) as any
  },
  patchProp(el, key, val) {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  },
})

export const createApp = (rootComponent: Component) => {
  return renderer.createApp(rootComponent)
}

export * from '../runtime-core'
