import { ASTNode } from './parse'

type CodeGenContext = {
  code: string
  push: (source: string) => void
}

export const generate = (ast: ASTNode) => {
  const context = createCodegenContext()
  context.push('return ')
  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  context.push(`function ${functionName}(${signature}){`)
  genNode(ast, context)
  context.push('}')

  return {
    code: context.code,
  }
}

function genNode(ast: ASTNode, context: CodeGenContext) {
  const node = ast.codegenNode
  context.push(`return "${node?.content}"`)
}

const createCodegenContext = (): CodeGenContext => {
  const context = {
    code: '',
    push(source: string) {
      context.code += source
    },
  }

  return context
}
