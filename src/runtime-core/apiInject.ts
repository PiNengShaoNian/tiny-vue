import { getCurrentInstance } from './component'

export interface InjectionKey<T> extends Symbol {}

export const provide = <T>(
  key: InjectionKey<T> | string | number,
  value: T
): void => {
  const currentInstance = getCurrentInstance()

  if (currentInstance) {
    const { provides } = currentInstance

    // TS doesn't allow symbol as index type
    provides[key as string] = value
  }
}

export const inject = <T>(
  key: string | InjectionKey<T> | number,
  defaultValue?: T | (() => T)
): T | undefined => {
  const currentInstance = getCurrentInstance()

  if (currentInstance) {
    const { parent } = currentInstance

    const parentProvides = parent?.provides

    if (parentProvides && (key as string) in parentProvides) {
      return parentProvides[key as string]
    } else {
      return typeof defaultValue === 'function'
        ? (defaultValue as any)()
        : defaultValue
    }
  }
}
