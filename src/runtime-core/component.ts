import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'
import { Component, VNode } from './vnode'
import { patch } from './renderer'

export type Slot = (scope?: any) => VNode | VNode[]

export type ComponentInternalInstance = {
  vnode: VNode
  setupState: unknown
  type: Component
  render: () => VNode
  props: any
  proxy: any
  emit: (event: string, ...args: any[]) => void
  slots: Record<string, Slot>
}

export const createComponentInstance = (vnode: VNode) => {
  const component: ComponentInternalInstance = {
    vnode,
    setupState: {},
    type: vnode.type as Component,
    render: () => null as any,
    proxy: null,
    props: null,
    emit: null as any,
    slots: {},
  }
  component.emit = emit.bind(null, component)
  return component
}

export const setupComponent = (instance: ComponentInternalInstance) => {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance)
}

export const setupRenderEffect = (
  instance: ComponentInternalInstance,
  vnode: VNode,
  container: HTMLElement
) => {
  const subTree = instance.render.call(instance.proxy)

  patch(subTree, container)

  vnode.el = subTree.el
}

function setupStatefulComponent(instance: ComponentInternalInstance) {
  const Component = instance.vnode.type as Component

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)
  const { setup } = Component

  if (setup) {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null)

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

const finishComponentSetup = (instance: ComponentInternalInstance) => {
  const Component = instance.type
  instance.render = Component.render
  // if (!Component.render) {
  //   instance.render = Component.render
  // }
}

let currentInstance: ComponentInternalInstance | null = null
export const getCurrentInstance = (): ComponentInternalInstance | null => {
  return currentInstance
}

export const setCurrentInstance = (
  instance: ComponentInternalInstance | null
) => {
  currentInstance = instance
}
