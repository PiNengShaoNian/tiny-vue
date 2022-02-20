import { isReadonly, readonly } from '../reactive'

describe('readonly', () => {
  it('should make nested values readonly', () => {
    // not set
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)

    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
    expect(isReadonly(wrapped)).toBeTruthy()
    expect(isReadonly(original)).toBeFalsy()
  })

  it('warn when call set', () => {
    //mock
    console.warn = jest.fn()

    const user = readonly({ age: 10 })

    user.age = 11

    expect(console.warn).toBeCalled()
  })
})
