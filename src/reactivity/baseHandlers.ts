import { extend, isObject } from '../shared'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive'

const createGetter = (isReadonly: boolean = false, shallow?: boolean) => {
  return (target: object, key: string | symbol) => {
    const res = Reflect.get(target, key)

    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    if (shallow) {
      return res
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      track(target, key)
    }

    return res
  }
}

const createSetter = () => {
  return (target: object, key: string | symbol, val: any) => {
    const res = Reflect.set(target, key, val)

    trigger(target, key)

    return res
  }
}

const get = createGetter()
const set = createSetter()

export const mutableHandlers = {
  get,
  set,
}

const readonlyGet = createGetter(true)
export const readonlyHandlers: ProxyHandler<object> = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(
      `key: ${key.toString()} set失败，应为target是readlonly的`,
      target
    )
    return true
  },
}

const shallowReadonlyGet = createGetter(true, true)

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
})
