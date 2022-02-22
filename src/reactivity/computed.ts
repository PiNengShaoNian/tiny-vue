import { ReactiveEffect } from './effect'

type Getter<T> = () => T
type ComputedRef<T> = { value: T }

class ComputedRefImpl<T> {
  private _dirty = true
  private _value!: T
  private _effect: ReactiveEffect
  private _getter: Getter<T>
  constructor(getter: Getter<T>) {
    this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }
  get value() {
    if (this._dirty) {
      this._dirty = false
      return (this._value = this._effect.run())
    } else {
      return this._value
    }
  }
}
export const computed = <T>(getter: Getter<T>): ComputedRef<T> => {
  return new ComputedRefImpl(getter)
}
