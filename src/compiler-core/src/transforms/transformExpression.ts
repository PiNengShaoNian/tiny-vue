import { NodeTypes } from '../ast'
import { ASTNode } from '../parse'

const processExpression = (node: ASTNode) => {
  node.content = `_ctx.${node.content}`

  return node
}

export const transformExpression = (node: ASTNode) => {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content)
  }
}
