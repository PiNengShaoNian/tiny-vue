import { ComponentInternalInstance } from './component'

export const emit = (
  instance: ComponentInternalInstance,
  event: string,
  ...args: any[]
) => {
  const props = instance.props
  const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c) => {
      return c ? c.toUpperCase() : ''
    })
  }
  const capitalize = (str: string): string => {
    return str[0].toUpperCase() + str.slice(1)
  }

  props['on' + capitalize(camelize(event))]?.(...args)
}
