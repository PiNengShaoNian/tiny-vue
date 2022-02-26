import { ShapeFlags } from '../shared/ShapeFlags'
import {
  ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
  setupRenderEffect,
} from './component'
import { VNode } from './vnode'
import { Fragment, Text } from './vnode'

export const render = (vnode: VNode, container: HTMLElement): void => {
  patch(vnode, container, null)
}

export const patch = (
  vnode: VNode,
  container: HTMLElement,
  parentComponent: ComponentInternalInstance | null
) => {
  const { type } = vnode
  switch (type) {
    case Fragment: {
      processFragment(vnode, container, parentComponent)
      break
    }
    case Text: {
      processText(vnode, container)
      break
    }
    default: {
      if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
    }
  }
}

const processComponent = (
  vnode: VNode,
  container: HTMLElement,
  parentComponent: ComponentInternalInstance | null
) => {
  mountComponent(vnode, container, parentComponent)
}

const mountComponent = (
  vnode: VNode,
  container: HTMLElement,
  parentComponent: ComponentInternalInstance | null
) => {
  const instance = createComponentInstance(vnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

const processElement = (
  vnode: VNode,
  container: HTMLElement,
  parentComponent: ComponentInternalInstance | null
) => {
  mountElement(vnode, container, parentComponent)
}

const mountElement = (
  vnode: VNode,
  container: HTMLElement,
  parentComponent: ComponentInternalInstance | null
) => {
  const el = (vnode.el = document.createElement(vnode.type as string))
  const { children, props } = vnode

  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children as string
  } else if (shapeFlag & ShapeFlags.ARRAY_CHLDREN) {
    mountChildren(vnode, el, parentComponent)
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

const mountChildren = (
  vnode: VNode,
  container: HTMLElement,
  parentComponent: ComponentInternalInstance | null
) => {
  for (const child of vnode.children as VNode[]) {
    patch(child, container, parentComponent)
  }
}
function processFragment(
  vnode: VNode,
  container: HTMLElement,
  parentComponent: ComponentInternalInstance | null
) {
  mountChildren(vnode, container, parentComponent)
}
function processText(vnode: VNode, container: HTMLElement) {
  const text = vnode.children as string
  const textNode = (vnode.el = document.createTextNode(text) as any)
  container.appendChild(textNode)
}
