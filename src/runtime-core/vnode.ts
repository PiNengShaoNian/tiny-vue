import { ShapeFlag, ShapeFlags } from '../shared/ShapeFlags'
import { ComponentInternalInstance } from './component'
import { RendererNode } from './renderer'

export const Fragment = Symbol()

export const Text = Symbol()

export type VNode<HostElement = RendererNode> = {
  type: ComponentType
  props: null | Record<string, any>
  children: undefined | string | VNode[]
  el: HostElement | null
  shapeFlag: ShapeFlag
  key: string | number | null
  component: null | ComponentInternalInstance<HostElement>
}

export type Component = {
  render(): VNode
  setup?: (
    props: any,
    context: { emit: (event: string, ...args: any[]) => void }
  ) => unknown
}

export type ComponentType = Component | string | symbol

export const createVNode = <HostElement = RendererNode>(
  type: ComponentType,
  props?: any,
  children?: any
): VNode<HostElement> => {
  const vnode: VNode<HostElement> = {
    type,
    props,
    children,
    el: null,
    key: props?.key ?? null,
    shapeFlag: getShapeFlag(type),
    component: null,
  }

  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHLDREN
  }

  if (vnode.shapeFlag | ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vnode
}

function getShapeFlag(type: ComponentType): ShapeFlag {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

export const createTextVNode = (text: string) => {
  return createVNode(Text, {}, text)
}
