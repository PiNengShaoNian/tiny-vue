import { computed } from '../computed'
import { reactive } from '../reactive'

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({ age: 1 })

    const age = computed(() => user.age)

    expect(age.value).toBe(user.age)
  })

  it('should compute lazily', () => {
    const value = reactive({ foo: 1 })
    const getter = jest.fn(() => value.foo)

    const cValue = computed(getter)

    expect(getter).not.toBeCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toBeCalledTimes(1)

    cValue.value
    expect(getter).toBeCalledTimes(1)

    value.foo = 2
    expect(cValue.value).toBe(2)
    expect(getter).toBeCalledTimes(2)

    cValue.value
    expect(getter).toBeCalledTimes(2)
  })
})
