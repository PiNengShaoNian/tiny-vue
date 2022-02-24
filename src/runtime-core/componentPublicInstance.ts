import { ComponentInternalInstance } from './component'

const publicPropertiesMap = {
  $el: (i: ComponentInternalInstance) => i.vnode.el,
} as const

type PublicInstanceInternalProperties = keyof typeof publicPropertiesMap

export const publicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }, key) {
    const setupState = instance.setupState as any
    if (key in setupState) {
      return setupState[key]
    }

    if (key in publicPropertiesMap) {
      return publicPropertiesMap[key as PublicInstanceInternalProperties](
        instance
      )
    }
  },
}
