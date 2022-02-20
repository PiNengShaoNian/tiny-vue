import { mutableHandlers, readonlyHandlers } from './baseHandlers'

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
