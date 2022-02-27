import { createRenderer } from '..'
import { Component } from '../runtime-core/vnode'

export const renderer = createRenderer<HTMLElement>({
  createElement(type) {
    return document.createElement(type)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, container, anchor) {
    container.insertBefore(el, anchor)
  },
  createText(text) {
    return document.createTextNode(text) as any
  },
  patchProp(el, key, prevProp: any, newProp: any) {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, newProp)
    } else {
      if (newProp === null || newProp === undefined) {
        el.removeAttribute(key)
      } else {
        el.setAttribute(key, newProp)
      }
    }
  },
  remove(el) {
    el.remove()
  },
})

export const createApp = (rootComponent: Component) => {
  return renderer.createApp(rootComponent)
}

export * from '../runtime-core'
