import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export const reactive = <T extends object>(raw: T): T => {
  return createActiveObject(raw, mutableHandlers as ProxyHandler<T>)
}

export const readonly = <T extends object>(raw: T): T => {
  return createActiveObject(raw, readonlyHandlers as ProxyHandler<T>)
}

export const createActiveObject = <T extends object>(
  raw: T,
  baseHandlers: ProxyHandler<T>
): T => {
  return new Proxy(raw, baseHandlers)
}

export const isReactive = (obj: any): boolean => {
  return obj?.[ReactiveFlags.IS_REACTIVE] ?? false
}

export const isReadonly = (obj: any): boolean => {
  return obj?.[ReactiveFlags.IS_READONLY] ?? false
}
