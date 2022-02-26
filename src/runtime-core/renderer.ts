import { effect } from '..'
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
    patch(null, vnode, container, null)
  }

  /**
   *
   * @param n1 老节点
   * @param n2 新节点
   * @param container
   * @param parentComponent
   */
  const patch = (
    n1: VNode | null,
    n2: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    const { type } = n2
    switch (type) {
      case Fragment: {
        processFragment(n1, n2, container, parentComponent)
        break
      }
      case Text: {
        processText(n1, n2, container)
        break
      }
      default: {
        if (n2.shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
      }
    }
  }

  const setupRenderEffect = (
    instance: ComponentInternalInstance,
    vnode: VNode,
    container: HostElement
  ) => {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ))

        patch(null, subTree, container, instance)

        vnode.el = subTree.el
        instance.isMounted = true
      } else {
        const prevSubTree = instance.subTree
        const subTree = instance.render.call(instance.proxy)
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  const processComponent = (
    n1: VNode | null,
    n2: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    mountComponent(n2, container, parentComponent)
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
    n1: VNode | null,
    n2: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) => {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  const patchElement = (n1: VNode, n2: VNode, container: HostElement) => {
    console.log('n1', n1, 'n2', n2, 'patchELement')
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
      patch(null, child, container, parentComponent)
    }
  }
  function processFragment(
    n1: VNode | null,
    n2: VNode,
    container: HostElement,
    parentComponent: ComponentInternalInstance | null
  ) {
    mountChildren(n2, container, parentComponent)
  }
  function processText(n1: VNode | null, n2: VNode, container: HostElement) {
    const text = n2.children as string
    const textNode = (n2.el = createText(text) as any)
    insert(textNode, container)
  }

  return {
    createApp: createAppAPI(render),
  }
}
