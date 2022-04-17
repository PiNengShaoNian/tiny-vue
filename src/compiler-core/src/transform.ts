import { NodeTypes } from './ast'
import { ASTNode } from './parse'
import { TO_DISPLAY_STRING } from './runtimeHelpers'

type ASTNodeVisitor = (node: ASTNode) => void
type TransformOptions = {
  nodeTransforms?: ASTNodeVisitor[]
}
type TransformContext = {
  root: ASTNode
  nodeTransforms: ASTNodeVisitor[]
  helper: (key: symbol) => void
  helpers: Map<symbol, number>
}

const createTransformContext = (
  root: ASTNode,
  options: TransformOptions
): TransformContext => {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms ?? [],
    helpers: new Map<symbol, number>(),
    helper(key: symbol) {
      context.helpers.set(key, 1)
    },
  }

  return context
}

export const transform = (root: ASTNode, options: TransformOptions = {}) => {
  const context = createTransformContext(root, options)
  traverseNode(root, context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

const createRootCodegen = (root: ASTNode) => {
  root.codegenNode = root.children?.[0]
}

const traverseNode = (node: ASTNode, context: TransformContext) => {
  const nodeTransforms = context.nodeTransforms

  for (let i = 0; i < nodeTransforms.length; ++i) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION: {
      context.helper(TO_DISPLAY_STRING)
      break
    }
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT: {
      traverseChildren(node, context)
      break
    }
  }
}

const traverseChildren = (node: ASTNode, context: TransformContext) => {
  const children = node.children
  if (children) {
    const n = children.length
    for (let i = 0; i < n; ++i) {
      traverseNode(children[i], context)
    }
  }
}
