import { reactive } from '../reactive'
import { effect, stop } from '../effect'
describe('effct', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })

    let nextAge

    effect(() => {
      nextAge = user.age + 1
      console.log(nextAge)
    })

    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })

  it('should return runner when call effect', () => {
    let foo = 0
    const runner = effect(() => {
      foo++

      return 'foo'
    })

    expect(foo).toBe(1)

    const r = runner()

    expect(foo).toBe(2)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        scheduler,
      }
    )

    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)

    //should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    //manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ foo: 1 })
    const runner = effect(() => {
      dummy = obj.foo
    })

    obj.foo = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.foo = 3
    expect(dummy).toBe(2)

    // stop effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    const obj = reactive({
      foo: 1,
    })
    let dummy

    const onStop = jest.fn()

    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop,
      }
    )

    stop(runner)
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
