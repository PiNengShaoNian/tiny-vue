import { Slot } from '../component'
import { createVNode } from '../vnode'
import { Fragment } from '../vnode'

export const renderSlot = (
  slots: Record<string, Slot>,
  key: string,
  props: any = {}
) => {
  return createVNode(Fragment, {}, slots?.[key]?.(props))
}
