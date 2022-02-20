import { track, trigger } from './effect'

const createGetter = (isReadonly: boolean = false) => {
  return (target: object, key: string | symbol) => {
    const res = Reflect.get(target, key)

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
