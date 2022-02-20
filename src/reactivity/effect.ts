import { extend } from '../shared'

class ReactiveEffect {
  deps: Set<ReactiveEffect>[] = []
  active = true
  onStop?: Function
  constructor(public fn: Function, public scheduler?: Function) {}
  run() {
    activeEffect = this
    return this.fn()
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.onStop?.()
      this.active = false
    }
  }
}

const cleanupEffect = (effect: ReactiveEffect) => {
  for (const dep of effect.deps) {
    dep.delete(effect)
  }
}

type Runner = Function & { effect: ReactiveEffect }
type EffectOptions = { scheduler?: Function; onStop?: Function }
export const effect = (fn: Function, options?: EffectOptions): Runner => {
  const _effect = new ReactiveEffect(fn, options?.scheduler)
  extend(_effect, options)

  _effect.run()
  const runner = _effect.run.bind(_effect) as unknown as Runner
  runner.effect = _effect

  return runner
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

  if (activeEffect) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export const trigger = (target: any, key: string | symbol) => {
  const depsMap = targetMap.get(target)
  const dep = depsMap?.get(key)!

  for (const effect of dep) {
    if (effect.scheduler) effect.scheduler()
    else effect.run()
  }
}

export const stop = (runner: Runner) => {
  runner.effect.stop()
}
