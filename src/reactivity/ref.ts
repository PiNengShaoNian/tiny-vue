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

export const unRef = <T>(ref: Ref<T>): T => {
  if (isRef(ref)) return ref.value
  else return ref
}
