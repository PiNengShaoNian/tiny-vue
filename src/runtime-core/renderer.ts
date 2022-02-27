import { effect } from '..'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import {
  ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
} from './component'
import { createAppAPI } from './createApp'
import { VNode } from './vnode'
import { Fragment, Text } from './vnode'

export type RendererOptions<HostElement> = {
  createElement: (type: string) => HostElement
  insert: (
    el: HostElement,
    container: HostElement,
    anchor: HostElement | null
  ) => void
  patchProp: (el: HostElement, key: string, prevProp: any, newProp: any) => void
  createText: (text: string) => HostElement
  setElementText: (el: HostElement, text: string) => void
  remove: (el: HostElement) => void
}

// Renderer Node can technically be any object in the context of core renderer
// logic - they are never directly operated on and always passed to the node op
// functions provided via options, so the internal constraint is really just
// a generic object.
export interface RendererNode {
  [key: string]: any
}

export type RootRenderFunction<HostElement> = (
  vnode: VNode<HostElement>,
  container: HostElement
) => void

export const createRenderer = <HostElement = RendererNode>(
  options: RendererOptions<HostElement>
) => {
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    patchProp: hostPatchProp,
    createText: hostCreateText,
    setElementText: hostSetElementText,
    remove: hostRemove,
  } = options

  const render = (vnode: VNode<HostElement>, container: HostElement): void => {
    patch(null, vnode, container, null, null)
  }

  /**
   *
   * @param n1 老节点
   * @param n2 新节点
   * @param container
   * @param parentComponent
   */
  const patch = (
    n1: VNode<HostElement> | null,
    n2: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    anchor: HostElement | null
  ) => {
    const { type } = n2
    switch (type) {
      case Fragment: {
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      }
      case Text: {
        processText(n1, n2, container, anchor)
        break
      }
      default: {
        if (n2.shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
      }
    }
  }

  const setupRenderEffect = (
    instance: ComponentInternalInstance<HostElement>,
    vnode: VNode<HostElement>,
    container: HostElement
  ) => {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ))

        patch(null, subTree, container, instance, null)

        vnode.el = subTree.el
        instance.isMounted = true
      } else {
        const prevSubTree = instance.subTree
        const subTree = instance.render.call(instance.proxy)
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance, null)
      }
    })
  }

  const processComponent = (
    n1: VNode<HostElement> | null,
    n2: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null
  ) => {
    mountComponent(n2, container, parentComponent)
  }

  const mountComponent = (
    vnode: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null
  ) => {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  const processElement = (
    n1: VNode<HostElement> | null,
    n2: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    anchor: HostElement | null
  ) => {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  const unmountChildren = (children: VNode<HostElement>[]) => {
    const n = children.length

    for (let i = 0; i < n; ++i) {
      const el = children[i].el
      if (el) hostRemove(el)
    }
  }

  const patchChildren = (
    n1: VNode<HostElement>,
    n2: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    anchor: HostElement | null
  ) => {
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //这个分支处理以下两种请款
      //(1). 之前是数组，现在是文字
      //(2). 之前是文字，现在还是文字
      if (prevShapeFlag & ShapeFlags.ARRAY_CHLDREN) {
        unmountChildren(n1.children as [])
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2 as string)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(
          n2.children as VNode<HostElement>[],
          container,
          parentComponent,
          anchor
        )
      } else {
        // array diff array
        patchKeyedChildren(
          n1.children as VNode<HostElement>[],
          n2.children as VNode<HostElement>[],
          container,
          parentComponent,
          anchor
        )
      }
    }
  }

  const patchKeyedChildren = (
    c1: VNode<HostElement>[],
    c2: VNode<HostElement>[],
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    parentAnchor: HostElement | null
  ) => {
    const l1 = c1.length
    const l2 = c2.length
    let i = 0
    let e1 = l1 - 1
    let e2 = l2 - 1

    //左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      ++i
    }

    //右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      --e1
      --e2
    }

    if (i > e1) {
      //新节点比老节点多，需要创建
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        for (; i <= e2; ++i) {
          patch(null, c2[i], container, parentComponent, anchor)
        }
        return
      }
    } else if (i > e2) {
      //新节点数量比老节点少，需要删除
      for (; i <= e1; ++i) {
        hostRemove(c1[i].el!)
      }
    }
  }

  const isSameVNodeType = (n1: VNode<HostElement>, n2: VNode<HostElement>) => {
    return n1.type === n2.type && n1.key === n2.key
  }
  const patchElement = (
    n1: VNode<HostElement>,
    n2: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    anchor: HostElement | null
  ) => {
    const oldProps: any = n1.props || EMPTY_OBJ
    const newProps: any = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)!
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el as HostElement, oldProps, newProps)
  }

  const patchProps = (
    el: HostElement,
    oldProps: Record<string, any>,
    newProps: Record<string, any>
  ): void => {
    if (oldProps === newProps) return

    for (const key in newProps) {
      const prevProp = oldProps[key]
      const newProp = newProps[key]

      if (prevProp !== newProp) {
        hostPatchProp(el, key, prevProp, newProp)
      }
    }

    if (oldProps === EMPTY_OBJ) return

    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  const mountElement = (
    vnode: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    anchor: HostElement | null
  ) => {
    const el = (vnode.el = hostCreateElement(vnode.type as string))
    const { children, props } = vnode

    const { shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHLDREN) {
      mountChildren(
        vnode.children as VNode<HostElement>[],
        el,
        parentComponent,
        anchor
      )
    }

    for (const key in props as object) {
      const val = (props as any)[key]

      hostPatchProp(el, key, null, val)
    }

    hostInsert(el, container, anchor)
  }

  const mountChildren = (
    children: VNode<HostElement>[],
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    anchor: HostElement | null
  ) => {
    for (const child of children) {
      patch(null, child, container, parentComponent, anchor)
    }
  }
  function processFragment(
    n1: VNode<HostElement> | null,
    n2: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null,
    anchor: HostElement | null
  ) {
    mountChildren(
      n2.children as VNode<HostElement>[],
      container,
      parentComponent,
      anchor
    )
  }
  function processText(
    n1: VNode<HostElement> | null,
    n2: VNode<HostElement>,
    container: HostElement,
    anchor: HostElement | null
  ) {
    const text = n2.children as string
    const textNode = (n2.el = hostCreateText(text) as any)
    hostInsert(textNode, container, anchor)
  }

  return {
    createApp: createAppAPI(render),
  }
}
