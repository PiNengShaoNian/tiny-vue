'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createVNode = function (type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHLDREN */;
    }
    return vnode;
};
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

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

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var publicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
        }
    },
};

var createComponentInstance = function (vnode) {
    var component = {
        vnode: vnode,
        setupState: {},
        type: vnode.type,
        render: function () { return null; },
        proxy: null,
    };
    return component;
};
var setupComponent = function (instance) {
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
};
var setupRenderEffect = function (instance, vnode, container) {
    var subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
};
function setupStatefulComponent(instance) {
    var Component = instance.vnode.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
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
    if (vnode.shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
};
var processComponent = function (vnode, container) {
    mountComponent(vnode, container);
};
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
};
var processElement = function (vnode, container) {
    mountElement(vnode, container);
};
var mountElement = function (vnode, container) {
    var el = (vnode.el = document.createElement(vnode.type));
    var children = vnode.children, props = vnode.props;
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHLDREN */) {
        mountChildren(vnode, el);
    }
    for (var key in props) {
        var val = props[key];
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, props[key]);
        }
        else {
            el.setAttribute(key, val);
        }
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

exports.createApp = createApp;
exports.h = h;
