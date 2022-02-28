import { VNode } from './vnode'

export const shouldUpdateComponent = (n1: VNode, n2: VNode): boolean => {
  const { props: prevProps } = n1
  const { props: nextProps } = n2

  for (const key in nextProps) {
    if (nextProps[key] !== prevProps?.[key]) {
      return true
    }
  }

  return false
}
