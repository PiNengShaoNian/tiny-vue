import { Component, VNode } from './createVNode'
import { patch } from './renderer'

export type ComponentInternalInstance = {
  vnode: VNode
  setupState: unknown
  type: Component
  render: () => VNode
}

export const createComponentInstance = (vnode: VNode) => {
  const component: ComponentInternalInstance = {
    vnode,
    setupState: null,
    type: vnode.type as Component,
    render: () => null as any,
  }
  return component
}

export const setupComponent = (instance: ComponentInternalInstance) => {
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

export const setupRenderEffect = (
  instance: ComponentInternalInstance,
  container: HTMLElement
) => {
  const subTree = instance.render()

  patch(subTree, container)
}

function setupStatefulComponent(instance: ComponentInternalInstance) {
  const Component = instance.vnode.type as Component
  const { setup } = Component

  if (setup) {
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

const handleSetupResult = (
  instance: ComponentInternalInstance,
  setupResult: any
) => {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: ComponentInternalInstance) {
  const Component = instance.type
  instance.render = Component.render
  // if (!Component.render) {
  //   instance.render = Component.render
  // }
}
