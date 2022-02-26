import { extend } from '../shared'

let activeEffect: ReactiveEffect | undefined
let shouldTrack = false

export class ReactiveEffect {
  deps: Set<ReactiveEffect>[] = []
  active = true
  onStop?: Function
  constructor(public fn: Function, public scheduler?: Function) {}
  run() {
    if (!this.active) {
      return this.fn()
    }
    shouldTrack = true
    activeEffect = this
    const res = this.fn()
    shouldTrack = false
    return res
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

  effect.deps.length = 0
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

const targetMap = new Map<object, Map<string | symbol, Set<ReactiveEffect>>>()
export const track = (target: any, key: string | symbol) => {
  if (!isTracking()) return

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

  trackEffects(dep)
}

export const trackEffects = (dep: Set<ReactiveEffect>): void => {
  if (!activeEffect || dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export const isTracking = (): boolean => {
  return shouldTrack && !!activeEffect
}

export const trigger = (target: any, key: string | symbol) => {
  const depsMap = targetMap.get(target)
  const dep = depsMap?.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}

export const triggerEffects = (dep: Set<ReactiveEffect>) => {
  for (const effect of dep) {
    if (effect.scheduler) effect.scheduler()
    else effect.run()
  }
}

export const stop = (runner: Runner) => {
  runner.effect.stop()
}
