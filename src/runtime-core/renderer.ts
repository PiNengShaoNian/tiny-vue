import { isObject } from '../shared/index'
import { ShapeFlags } from '../shared/ShapeFlags'
import {
  createComponentInstance,
  setupComponent,
  setupRenderEffect,
} from './component'
import { VNode } from './createVNode'

export const render = (vnode: VNode, container: HTMLElement): void => {
  patch(vnode, container)
}

export const patch = (vnode: VNode, container: HTMLElement) => {
  if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
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
    el.setAttribute(key, val)
  }

  container.appendChild(el)
}

const mountChildren = (vnode: VNode, container: HTMLElement) => {
  for (const child of vnode.children as VNode[]) {
    patch(child, container)
  }
}
