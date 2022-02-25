import { Slot } from '../component'
import { createVNode } from '../createVNode'

export const renderSlot = (
  slots: Record<string, Slot>,
  key: string,
  props: any = {}
) => {
  return createVNode('div', {}, slots?.[key]?.(props))
}
