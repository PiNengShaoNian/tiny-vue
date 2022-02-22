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
  processComponent(vnode, container)
}

const processComponent = (vnode: VNode, container: HTMLElement) => {
  mountComponent(vnode, container)
}

const mountComponent = (vnode: VNode, container: HTMLElement) => {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}
