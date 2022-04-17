import { NodeTypes } from './ast'
import { ASTNode } from './parse'
import { helperMapName, TO_DISPLAY_STRING } from './runtimeHelpers'

type CodeGenContext = {
  code: string
  push: (source: string) => void
  helper(key: Symbol): string
}

export const generate = (ast: ASTNode) => {
  const context = createCodegenContext()
  const { push } = context

  genFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName}(${signature}){`)
  push('return ')
  genNode(ast.codegenNode!, context)
  push('}')

  return {
    code: context.code,
  }
}

function genFunctionPreamble(ast: ASTNode, context: CodeGenContext) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = (s: symbol) => `${helperMapName[s]}: _${helperMapName[s]}`
  if (ast.helpers && ast.helpers.length) {
    push(
      `const { ${ast.helpers?.map(aliasHelper).join(', ')} } = ${VueBinging}`
    )
  }
  push('\n')
  push('return ')
}

const genText = (node: ASTNode, context: CodeGenContext) => {
  const { push } = context
  push(`"${node?.content}"`)
}

const genInterpolation = (node: ASTNode, context: CodeGenContext) => {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

const genExpression = (node: ASTNode, context: CodeGenContext) => {
  const { push } = context
  push(node.content)
}

const genNode = (node: ASTNode, context: CodeGenContext) => {
  switch (node?.type) {
    case NodeTypes.TEXT: {
      genText(node, context)
      break
    }
    case NodeTypes.INTERPOLATION: {
      genInterpolation(node, context)
      break
    }
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
  }
}

const createCodegenContext = (): CodeGenContext => {
  const context = {
    code: '',
    push(source: string) {
      context.code += source
    },
    helper(key: symbol) {
      return `_${helperMapName[key]}`
    },
  }

  return context
}
