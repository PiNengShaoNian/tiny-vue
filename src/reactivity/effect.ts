class ReactiveEffect {
  constructor(public fn: Function) {}
  run() {
    activeEffect = this
    this.fn()
  }
}

export const effect = (fn: Function) => {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
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
    effect.run()
  }
}
