import { generate } from '../src/codegen'
import { baseParse } from '../src/parse'
import { transform } from '../src/transform'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')

    transform(ast as any)
    const { code } = generate(ast as any)

    expect(code).toMatchSnapshot()
  })
})
