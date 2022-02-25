import { ShapeFlags } from '../shared/ShapeFlags'
import { ComponentInternalInstance, Slot } from './component'
import { VNode } from './vnode'

export const initSlots = (
  instance: ComponentInternalInstance,
  children: any
): void => {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

const normalizeObjectSlots = (children: any, slots: Record<string, Slot>) => {
  for (const key in children) {
    const slot = children[key]
    slots[key] = (props: any) => normalizeSlotValue(slot(props))
  }
}

const normalizeSlotValue = (value: VNode[] | VNode) => {
  return Array.isArray(value) ? value : [value]
}
