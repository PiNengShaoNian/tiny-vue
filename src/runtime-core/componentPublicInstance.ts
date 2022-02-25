import { hasOwn } from '../shared'
import { ComponentInternalInstance } from './component'

const publicPropertiesMap = {
  $el: (i: ComponentInternalInstance) => i.vnode.el,
} as const

type PublicInstanceInternalProperties = keyof typeof publicPropertiesMap

export const publicInstanceProxyHandlers: ProxyHandler<{
  _: ComponentInternalInstance
}> = {
  get({ _: instance }, key) {
    const setupState = instance.setupState as any
    const props = instance.props
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }

    if (key in publicPropertiesMap) {
      return publicPropertiesMap[key as PublicInstanceInternalProperties](
        instance
      )
    }
  },
}
