import { generate } from '../src/codegen'
import { baseParse } from '../src/parse'
import { transform } from '../src/transform'
import { transformExpression } from '../src/transforms/transformExpression'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')

    transform(ast as any)
    const { code } = generate(ast)

    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')

    transform(ast as any, {
      nodeTransforms: [transformExpression],
    })
    const { code } = generate(ast)

    expect(code).toMatchSnapshot()
  })
})
