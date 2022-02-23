var createVNode = function (type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

var isObject = function (obj) {
    return obj !== null && typeof obj === 'object';
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
    patch(subTree, container);
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
    patch(vnode, container);
};
var patch = function (vnode, container) {
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
};
var processComponent = function (vnode, container) {
    mountComponent(vnode, container);
};
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
};
var processElement = function (vnode, container) {
    mountElement(vnode, container);
};
var mountElement = function (vnode, container) {
    var el = document.createElement(vnode.type);
    var children = vnode.children, props = vnode.props;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    container.appendChild(el);
};
var mountChildren = function (vnode, container) {
    var e_1, _a;
    try {
        for (var _b = __values(vnode.children), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            patch(child, container);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
};

var h = function (type, props, children) {
    return createVNode(type, props, children);
};

export { createApp, h };
