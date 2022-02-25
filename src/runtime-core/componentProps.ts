import { ComponentInternalInstance } from './component'

export const initProps = (
  instance: ComponentInternalInstance,
  rawProps: any
): void => {
  instance.props = rawProps || {}
}
