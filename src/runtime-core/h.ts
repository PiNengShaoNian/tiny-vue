import { ComponentType, createVNode } from './vnode'

export const h = (type: ComponentType, props?: any, children?: any) => {
  return createVNode(type, props, children)
}
