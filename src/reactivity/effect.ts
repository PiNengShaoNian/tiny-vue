class ReactiveEffect {
  constructor(public fn: Function, public scheduler?: Function) {}
  run() {
    activeEffect = this
    return this.fn()
  }
}

export const effect = (fn: Function, options?: { scheduler: Function }) => {
  const _effect = new ReactiveEffect(fn, options?.scheduler)

  _effect.run()

  return _effect.run.bind(_effect)
}

let activeEffect: ReactiveEffect | undefined

const targetMap = new Map<object, Map<string | symbol, Set<ReactiveEffect>>>()
export const track = (target: any, key: string | symbol) => {
  let depsMap = targetMap.get(target)

  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)

  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  dep.add(activeEffect!)
}

export const trigger = (target: any, key: string | symbol) => {
  const depsMap = targetMap.get(target)
  const dep = depsMap?.get(key)!

  for (const effect of dep) {
    if (effect.scheduler) effect.scheduler()
    else effect.run()
  }
}
