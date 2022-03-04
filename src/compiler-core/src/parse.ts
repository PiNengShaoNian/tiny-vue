import { NodeTypes } from './ast'

type ParserContext = {
  source: string
}

const enum TagType {
  Start,
  End,
}

export const baseParse = (content: string) => {
  const context = createParserContext(content)

  return createRoot(parseChildren(context))
}

const parseChildren = (context: ParserContext) => {
  const nodes: any[] = []

  let node
  const s = context.source
  if (s.startsWith('{{')) {
    node = parseInterpolation(context)
  } else if (s[0] === '<') {
    const firstChar = s[1]
    if (firstChar >= 'a' && firstChar <= 'z') {
      node = parseElement(context)
    }
  }

  if (!node) {
    node = parseText(context)
  }

  nodes.push(node)
  return nodes
}

const parseTextData = (context: ParserContext, length: number) => {
  const s = context.source
  const content = s.slice(0, length)

  return content
}

const parseText = (context: ParserContext) => {
  const content = parseTextData(context, context.source.length)

  advanceBy(context, content.length)
  return {
    type: NodeTypes.TEXT,
    content: content,
  }
}

const parseTag = (context: ParserContext, tagType: TagType) => {
  const match = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match![1]

  advanceBy(context, match![0].length)
  advanceBy(context, 1)

  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  }
}

const parseElement = (context: ParserContext) => {
  const element = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)

  return element
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

  const rawContent = parseTextData(context, rawContentLength)
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
