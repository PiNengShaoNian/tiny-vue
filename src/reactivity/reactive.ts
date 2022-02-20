import { track, trigger } from './effect'

export const reactive = <T extends object>(raw: T): T => {
  return new Proxy(raw, {
    get(target, key) {
      track(target, key)
      return Reflect.get(target, key)
    },
    set(target, key, val) {
      const res = Reflect.set(target, key, val)

      trigger(target, key)
      return res
    },
  })
}
