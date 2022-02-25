import { isObject } from '../shared'
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export const reactive = <T extends object>(raw: T): T => {
  return createReactiveObject(raw, mutableHandlers as ProxyHandler<T>)
}

export const readonly = <T extends object>(raw: T): T => {
  return createReactiveObject(raw, readonlyHandlers as ProxyHandler<T>)
}

export const createReactiveObject = <T extends object>(
  raw: T,
  baseHandlers: ProxyHandler<T>
): T => {
  if (!isObject(raw)) {
    console.warn(`target ${raw} 必须是一个对象`)
    return raw
  }
  return new Proxy(raw, baseHandlers)
}

export const isReactive = (obj: any): boolean => {
  return obj?.[ReactiveFlags.IS_REACTIVE] ?? false
}

export const isReadonly = (obj: any): boolean => {
  return obj?.[ReactiveFlags.IS_READONLY] ?? false
}

export const shallowReadonly = <T extends object>(raw: T): T => {
  return createReactiveObject(raw, shallowReadonlyHandlers as ProxyHandler<T>)
}

export const isProxy = (obj: any) => {
  return isReactive(obj) || isReadonly(obj)
}
