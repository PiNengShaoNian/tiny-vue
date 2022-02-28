import { effect } from '..'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import {
  ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
} from './component'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { queueJobs } from './scheduler'
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
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          const subTree = (instance.subTree = instance.render.call(
            instance.proxy
          ))

          patch(null, subTree, container, instance, null)

          vnode.el = subTree.el
          instance.isMounted = true
        } else {
          //更新组件本身
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el

            updateComponentPreRender(instance, next)
          }

          //更新他的子树
          const prevSubTree = instance.subTree
          const subTree = instance.render.call(instance.proxy)
          instance.subTree = subTree

          patch(prevSubTree, subTree, container, instance, null)
        }
      },
      {
        scheduler() {
          queueJobs(instance.update)
        },
      }
    )
  }

  const processComponent = (
    n1: VNode<HostElement> | null,
    n2: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null
  ) => {
    if (!n1) {
      mountComponent(n2, container, parentComponent)
    } else {
      updateComponent(n1, n2)
    }
  }

  const mountComponent = (
    vnode: VNode<HostElement>,
    container: HostElement,
    parentComponent: ComponentInternalInstance<HostElement> | null
  ) => {
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ))
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
    } else {
      let s1 = i
      let s2 = i
      const toBePatched = e2 - s2 + 1
      let patched = 0
      const keyToNewIndex = new Map<string | number, number>()
      const newIndexToOldIndex: number[] = Array.from<number>({
        length: toBePatched,
      }).fill(0)
      let moved = false
      let maxNewIndexSoFar = 0

      for (let i = s2; i <= e2; ++i) {
        const key = c2[i].key
        if (key !== null) {
          keyToNewIndex.set(key, i)
        }
      }

      for (let i = s1; i <= e1; ++i) {
        const prevChild = c1[i]
        if (patched >= toBePatched) {
          hostRemove(prevChild.el!)
          continue
        }
        let newIndex: number | undefined
        if (prevChild.key !== null) {
          newIndex = keyToNewIndex.get(prevChild.key)
        } else {
          for (let j = s2; j <= e2; ++j) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el!)
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          newIndexToOldIndex[newIndex - s2] = i + 1
          ++patched
          patch(prevChild, c2[newIndex], container, parentComponent, null)
        }
      }

      const increasingNewIndexSequence = moved ? getLIS(newIndexToOldIndex) : []
      let j = increasingNewIndexSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; --i) {
        const newIndex = i + s2
        const nextChild = c2[newIndex]
        const anchor = newIndex + 1 < l2 ? c2[newIndex + 1].el! : null

        if (newIndexToOldIndex[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          if (
            j <= 0 ||
            newIndexToOldIndex[i] !== increasingNewIndexSequence[j]
          ) {
            hostInsert(nextChild.el!, container, anchor)
          } else {
            --j
          }
        }
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

  const updateComponent = (n1: VNode<HostElement>, n2: VNode<HostElement>) => {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance!.next = n2
      instance!.update()
    } else {
      n2.el = n1.el
      instance!.vnode = n2
    }
  }

  const processText = (
    n1: VNode<HostElement> | null,
    n2: VNode<HostElement>,
    container: HostElement,
    anchor: HostElement | null
  ) => {
    const text = n2.children as string
    const textNode = (n2.el = hostCreateText(text) as any)
    hostInsert(textNode, container, anchor)
  }

  return {
    createApp: createAppAPI(render),
  }
}

const getLIS = (nums: number[]): number[] => {
  //通过二分查找插入位置动态构建出来的最长递增子序列
  //tails[i]表示长度为i的最长递增子序列，该序列最后的一个数字的最小值为tails[i]
  const tails: number[] = []
  let len = 1
  tails[1] = nums[0]

  for (let i = 1; i < nums.length; ++i) {
    if (nums[i] > tails[len]) {
      tails[++len] = nums[i]
    } else {
      //左边从1开始tails[0]为未定义行为
      let l = 1
      let r = len
      let pos = 0

      while (l <= r) {
        const mid = (l + r) >> 1
        if (tails[mid] < nums[i]) {
          pos = mid
          l = mid + 1
        } else {
          r = mid - 1
        }
      }

      tails[pos + 1] = nums[i]
    }
  }

  return tails
}

const updateComponentPreRender = (
  instance: ComponentInternalInstance,
  next: VNode
) => {
  instance.props = next.props
  instance.vnode = next
  instance.next = null
}
