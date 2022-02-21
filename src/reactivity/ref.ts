import { hasChanged, isObject } from '../shared'
import {
  isTracking,
  ReactiveEffect,
  trackEffects,
  triggerEffects,
} from './effect'
import { reactive } from './reactive'

type Ref<T> = {
  value: T
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T
  public __v_isRef = true
  dep = new Set<ReactiveEffect>()
  constructor(value: T) {
    this._value = convert(value)
    this._rawValue = value
  }

  get value() {
    if (isTracking()) {
      trackEffects(this.dep)
    }
    return this._value
  }

  set value(val: T) {
    if (!hasChanged(this._rawValue, val)) return
    this._value = convert(val)
    this._rawValue = val
    triggerEffects(this.dep)
  }
}

export const ref = <T>(raw: T): Ref<T> => {
  return new RefImpl(raw)
}

const convert = <T>(value: T): T => {
  return isObject(value) ? reactive(value) : value
}

export const isRef = (ref: any): ref is Ref<unknown> => {
  return ref?.['__v_isRef'] ?? false
}

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: T[K] extends Ref<infer V>
    ? V
    : // if `V` is `unknown` that means it does not extend `Ref` and is undefined
    T[K] extends Ref<infer V> | undefined
    ? unknown extends V
      ? undefined
      : V | undefined
    : T[K]
}

export const unRef = <T>(ref: Ref<T>): T => {
  if (isRef(ref)) return ref.value
  else return ref
}

export const proxyRefs = <T extends object>(
  objectWithRefs: T
): ShallowUnwrapRef<T> => {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target: any, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        target[key].value = value
        return true
      } else {
        return Reflect.set(target, key, value)
      }
    },
  }) as any
}
