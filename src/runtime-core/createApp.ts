import { RendererNode, RootRenderFunction } from './renderer'
import { Component, createVNode } from './vnode'

type App<HostElement = RendererNode> = {
  mount(rootContainer: HostElement): void
}

export const createAppAPI = <HostElement = RendererNode>(
  render: RootRenderFunction<HostElement>
) => {
  const createApp = (rootComponent: Component): App<HostElement> => {
    return {
      mount(rootContainer: HostElement) {
        const vnode = createVNode<HostElement>(rootComponent)
        render(vnode, rootContainer)
      },
    }
  }
  return createApp
}
