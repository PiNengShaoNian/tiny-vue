import { ShapeFlags } from '../shared/ShapeFlags'
import {
  createComponentInstance,
  setupComponent,
  setupRenderEffect,
} from './component'
import { VNode } from './vnode'
import { Fragment, Text } from './vnode'

export const render = (vnode: VNode, container: HTMLElement): void => {
  patch(vnode, container)
}

export const patch = (vnode: VNode, container: HTMLElement) => {
  const { type } = vnode
  switch (type) {
    case Fragment: {
      processFragment(vnode, container)
      break
    }
    case Text: {
      processText(vnode, container)
      break
    }
    default: {
      if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
    }
  }
}

const processComponent = (vnode: VNode, container: HTMLElement) => {
  mountComponent(vnode, container)
}

const mountComponent = (vnode: VNode, container: HTMLElement) => {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

const processElement = (vnode: VNode, container: HTMLElement) => {
  mountElement(vnode, container)
}

const mountElement = (vnode: VNode, container: HTMLElement) => {
  const el = (vnode.el = document.createElement(vnode.type as string))
  const { children, props } = vnode

  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children as string
  } else if (shapeFlag & ShapeFlags.ARRAY_CHLDREN) {
    mountChildren(vnode, el)
  }

  for (const key in props as object) {
    const val = (props as any)[key]
    const isOn = (key: string) => /^on[A-Z]/.test(key)

    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, (props as any)[key])
    } else {
      el.setAttribute(key, val)
    }
  }

  container.appendChild(el)
}

const mountChildren = (vnode: VNode, container: HTMLElement) => {
  for (const child of vnode.children as VNode[]) {
    patch(child, container)
  }
}
function processFragment(vnode: VNode, container: HTMLElement) {
  mountChildren(vnode, container)
}
function processText(vnode: VNode, container: HTMLElement) {
  const text = vnode.children as string
  const textNode = (vnode.el = document.createTextNode(text) as any)
  container.appendChild(textNode)
}
