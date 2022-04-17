import { NodeTypes } from './ast'

type ParserContext = {
  source: string
}

const enum TagType {
  Start,
  End,
}

export type ASTNode = {
  content?: any
  children?: ASTNode[]
  type: NodeTypes
  tag?: string
  codegenNode?: ASTNode
  helpers?: symbol[]
}

export const baseParse = (content: string): ASTNode => {
  const context = createParserContext(content)

  return createRoot(parseChildren(context, []))
}

const isEnd = (context: ParserContext, ancestors: string[]) => {
  const s = context.source
  if (s.startsWith('</')) {
    const n = ancestors.length
    const startTag = ancestors[n - 1]

    if (!s.startsWith(`</${startTag}>`)) {
      throw new Error(`Missing end tag ${startTag}`)
    } else {
      return true
    }
  }

  return !s.length
}

const parseChildren = (context: ParserContext, ancestors: string[]) => {
  const nodes: any[] = []

  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      const firstChar = s[1]
      if (firstChar >= 'a' && firstChar <= 'z') {
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }

  return nodes
}

const parseTextData = (context: ParserContext, length: number) => {
  const s = context.source
  const content = s.slice(0, length)

  return content
}

const parseText = (context: ParserContext) => {
  let endIndex = context.source.length
  const endToken = ['{{', '<']
  const n = endToken.length

  for (let i = 0; i < n; ++i) {
    const index = context.source.indexOf(endToken[i])

    if (index !== -1 && index < endIndex) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)

  advanceBy(context, content.length)
  return {
    type: NodeTypes.TEXT,
    content: content,
  }
}

const parseTag = (context: ParserContext, tagType: TagType): ASTNode => {
  const match = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match![1]

  advanceBy(context, match![0].length)
  advanceBy(context, 1)

  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  }
}

const parseElement = (context: ParserContext, ancestors: string[]) => {
  const element = parseTag(context, TagType.Start)
  ancestors.push(element.tag!)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (context.source.slice(2, 2 + element.tag!.length) !== element.tag) {
    throw new Error(`Missing end tag ${element.tag}`)
  }

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

const createRoot = (children: ASTNode[]): ASTNode => {
  return {
    children,
    type: NodeTypes.ROOT,
  }
}

export const createParserContext = (content: string): ParserContext => {
  return {
    source: content,
  }
}
