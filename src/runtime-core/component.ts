import { proxyRefs } from '..'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'
import { Component, VNode } from './vnode'

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
  provides: Record<string | symbol, any>
  parent: ComponentInternalInstance | null
  isMounted: boolean
  subTree: VNode | null
}

export const createComponentInstance = (
  vnode: VNode,
  parent: ComponentInternalInstance | null
) => {
  const component: ComponentInternalInstance = {
    vnode,
    setupState: {},
    type: vnode.type as Component,
    render: () => null as any,
    proxy: null,
    props: null,
    emit: null as any,
    slots: {},
    provides: Object.create(parent?.provides ?? null),
    parent,
    isMounted: false,
    subTree: null,
  }
  component.emit = emit.bind(null, component)
  return component
}

export const setupComponent = (instance: ComponentInternalInstance) => {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance)
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
    instance.setupState = proxyRefs(setupResult)
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
