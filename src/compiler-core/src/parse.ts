import { NodeTypes } from './ast'

type ParserContext = {
  source: string
}

export const baseParse = (content: string) => {
  const context = createParserContext(content)

  return createRoot(parseChildren(context))
}

const parseChildren = (context: ParserContext) => {
  const nodes: unknown[] = []

  let node
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context)
  }
  nodes.push(node)
  return nodes
}

const advanceBy = (context: ParserContext, length: number) => {
  context.source = context.source.slice(length)
}

const parseInterpolation = (context: ParserContext) => {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = context.source.slice(0, rawContentLength)
  const content = rawContent.trim()
  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  }
}

const createRoot = (children: unknown) => {
  return {
    children,
  }
}

export const createParserContext = (content: string): ParserContext => {
  return {
    source: content,
  }
}
