import { ShapeFlags } from '../shared/ShapeFlags'
import {
  ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
} from './component'
import { createAppAPI } from './createApp'
import { VNode } from './vnode'
import { Fragment, Text } from './vnode'

export type RendererOptions<T> = {
  createElement: (type: string) => T
  insert: (el: T, container: T) => void
  patchProp: (el: T, key: string, val: any) => void
  createText: (text: string) => T
  setElementText: (el: T, text: string) => void
}

// Renderer Node can technically be any object in the context of core renderer
// logic - they are never directly operated on and always passed to the node op
// functions provided via options, so the internal constraint is really just
// a generic object.
export interface RendererNode {
  [key: string]: any
}

export type RootRenderFunction<HostElement> = (
  vnode: VNode<HostElement>,
  container: HostElement
) => void

export const createRenderer = <HostElement = RendererNode>(
  options: RendererOptions<HostElement>
) => {
  const { createElement, insert, patchProp, createText, setElementText } =
    options

  const render = (vnode: VNode, container: HostElement): void => {
    patch(vnode, container, null)
  }

  const patch = (
    vnode: VNode,
    container: HostElement,
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

  const setupRenderEffect = <T>(
    instance: ComponentInternalInstance,
    vnode: VNode,
    container: HostElement
  ) => {
    const subTree = instance.render.call(instance.proxy)

    patch(subTree, container, instance)

    vnode.el = subTree.el
  }

  const processComponent = (
    vnode: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    mountComponent(vnode, container, parentComponent)
  }

  const mountComponent = (
    vnode: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  const processElement = (
    vnode: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    mountElement(vnode, container, parentComponent)
  }

  const mountElement = (
    vnode: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    const el = (vnode.el = createElement(vnode.type as string))
    const { children, props } = vnode

    const { shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      setElementText(el, children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHLDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    for (const key in props as object) {
      const val = (props as any)[key]

      patchProp(el, key, val)
    }

    insert(el, container)
  }

  const mountChildren = (
    vnode: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    for (const child of vnode.children as VNode[]) {
      patch(child, container, parentComponent)
    }
  }
  function processFragment(
    vnode: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) {
    mountChildren(vnode, container, parentComponent)
  }
  function processText(vnode: VNode, container: HostElement) {
    const text = vnode.children as string
    const textNode = (vnode.el = createText(text) as any)
    insert(textNode, container)
  }

  return {
    createApp: createAppAPI(render),
  }
}
