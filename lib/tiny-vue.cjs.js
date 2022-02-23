'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createVNode = function (type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
};

var createComponentInstance = function (vnode) {
    var component = {
        vnode: vnode,
        setupState: null,
        type: vnode.type,
        render: function () { return null; },
    };
    return component;
};
var setupComponent = function (instance) {
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
};
var setupRenderEffect = function (instance, container) {
    var subTree = instance.render();
    patch(subTree);
};
function setupStatefulComponent(instance) {
    var Component = instance.vnode.type;
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
var handleSetupResult = function (instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
};
function finishComponentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
    // if (!Component.render) {
    //   instance.render = Component.render
    // }
}

var render = function (vnode, container) {
    patch(vnode);
};
var patch = function (vnode, container) {
    processComponent(vnode);
};
var processComponent = function (vnode, container) {
    mountComponent(vnode);
};
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode);
        },
    };
};

var h = function (type, props, children) {
    return createVNode(type, props, children);
};

exports.createApp = createApp;
exports.h = h;
