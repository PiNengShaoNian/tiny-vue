import { ShapeFlag, ShapeFlags } from '../shared/ShapeFlags'

export type VNode = {
  type: ComponentType
  props: unknown
  children: undefined | string | VNode[]
  el: HTMLElement | null
  shapeFlag: ShapeFlag
}

export type Component = {
  render(): VNode
  setup?: (
    props: any,
    context: { emit: (event: string, ...args: any[]) => void }
  ) => unknown
}

export type ComponentType = Component | string

export const createVNode = (
  type: ComponentType,
  props?: any,
  children?: any
) => {
  const vnode: VNode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  }

  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHLDREN
  }
  return vnode
}

function getShapeFlag(type: ComponentType): ShapeFlag {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}
