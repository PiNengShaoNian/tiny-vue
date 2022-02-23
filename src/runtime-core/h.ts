import { ComponentType, createVNode } from './createVNode'

export const h = (type: ComponentType, props?: any, children?: any) => {
  return createVNode(type, props, children)
}
