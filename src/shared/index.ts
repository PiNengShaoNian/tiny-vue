export const extend = Object.assign

export const isObject = (obj: any): obj is object => {
  return obj !== null && typeof obj === 'object'
}

export const hasChanged = (v1: any, v2: any): boolean => !Object.is(v1, v2)
