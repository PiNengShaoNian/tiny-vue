import { ASTNode } from './parse'

type ASTNodeVisitor = (node: ASTNode) => void
type TransformOptions = {
  nodeTransforms?: ASTNodeVisitor[]
}
type TransformContext = {
  root: ASTNode
  nodeTransforms: ASTNodeVisitor[]
}

const createTransformContext = (
  root: ASTNode,
  options: TransformOptions
): TransformContext => {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms ?? [],
  }

  return context
}

export const transform = (root: ASTNode, options: TransformOptions = {}) => {
  const context = createTransformContext(root, options)
  traverseNode(root, context)

  createRootCodegen(root)
}

const createRootCodegen = (root: ASTNode) => {
  root.codegenNode = root.children?.[0]
}

const traverseNode = (node: ASTNode, context: TransformContext) => {
  const children = node.children

  const nodeTransforms = context.nodeTransforms

  for (let i = 0; i < nodeTransforms.length; ++i) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  if (children) {
    const n = children.length
    for (let i = 0; i < n; ++i) {
      traverseNode(children[i], context)
    }
  }
}
