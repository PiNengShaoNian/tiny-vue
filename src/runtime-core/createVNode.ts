export type VNode = {
  type: ComponentType
  props: unknown
  children: undefined | string | VNode[]
}

export type Component = { render(): VNode; setup?: () => unknown }

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
  }
  return vnode
}
