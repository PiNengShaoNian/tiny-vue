'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (obj) => {
    return obj !== null && typeof obj === 'object';
};
const hasChanged = (v1, v2) => !Object.is(v1, v2);
const hasOwn = (obj, key) => { var _a; return (_a = obj === null || obj === void 0 ? void 0 : obj.hasOwnProperty(key)) !== null && _a !== void 0 ? _a : false; };
const EMPTY_OBJ = {};

let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
    }
    run() {
        if (!this.active) {
            return this.fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this.fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        var _a;
        if (this.active) {
            cleanupEffect(this);
            (_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this);
            this.active = false;
        }
    }
}
const cleanupEffect = (effect) => {
    for (const dep of effect.deps) {
        dep.delete(effect);
    }
    effect.deps.length = 0;
};
const effect = (fn, options) => {
    const _effect = new ReactiveEffect(fn, options === null || options === void 0 ? void 0 : options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
};
const targetMap = new Map();
const track = (target, key) => {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
};
const trackEffects = (dep) => {
    if (!activeEffect || dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
const isTracking = () => {
    return shouldTrack && !!activeEffect;
};
const trigger = (target, key) => {
    const depsMap = targetMap.get(target);
    const dep = depsMap === null || depsMap === void 0 ? void 0 : depsMap.get(key);
    if (dep) {
        triggerEffects(dep);
    }
};
const triggerEffects = (dep) => {
    for (const effect of dep) {
        if (effect.scheduler)
            effect.scheduler();
        else
            effect.run();
    }
};

const createGetter = (isReadonly = false, shallow) => {
    return (target, key) => {
        const res = Reflect.get(target, key);
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
};
const createSetter = () => {
    return (target, key, val) => {
        const res = Reflect.set(target, key, val);
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const mutableHandlers = {
    get,
    set,
};
const readonlyGet = createGetter(true);
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key.toString()} set失败，应为target是readlonly的`, target);
        return true;
    },
};
const shallowReadonlyGet = createGetter(true, true);
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

const reactive = (raw) => {
    return createReactiveObject(raw, mutableHandlers);
};
const readonly = (raw) => {
    return createReactiveObject(raw, readonlyHandlers);
};
const createReactiveObject = (raw, baseHandlers) => {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
};
const isReactive = (obj) => {
    var _a;
    return (_a = obj === null || obj === void 0 ? void 0 : obj["__v_isReactive" /* IS_REACTIVE */]) !== null && _a !== void 0 ? _a : false;
};
const shallowReadonly = (raw) => {
    return createReactiveObject(raw, shallowReadonlyHandlers);
};

const emit = (instance, event, ...args) => {
    var _a;
    const props = instance.props;
    const camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : '';
        });
    };
    const capitalize = (str) => {
        return str[0].toUpperCase() + str.slice(1);
    };
    (_a = props['on' + capitalize(camelize(event))]) === null || _a === void 0 ? void 0 : _a.call(props, ...args);
};

const initProps = (instance, rawProps) => {
    instance.props = rawProps || {};
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const setupState = instance.setupState;
        const props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
        }
    },
};

const initSlots = (instance, children) => {
    if (instance.vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
};
const normalizeObjectSlots = (children, slots) => {
    for (const key in children) {
        const slot = children[key];
        slots[key] = (props) => normalizeSlotValue(slot(props));
    }
};
const normalizeSlotValue = (value) => {
    return Array.isArray(value) ? value : [value];
};

const createComponentInstance = (vnode, parent) => {
    var _a;
    const component = {
        vnode,
        setupState: {},
        type: vnode.type,
        render: () => null,
        proxy: null,
        props: null,
        emit: null,
        slots: {},
        provides: Object.create((_a = parent === null || parent === void 0 ? void 0 : parent.provides) !== null && _a !== void 0 ? _a : null),
        parent,
        isMounted: false,
        subTree: null,
    };
    component.emit = emit.bind(null, component);
    return component;
};
const setupComponent = (instance) => {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
const handleSetupResult = (instance, setupResult) => {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
};
const finishComponentSetup = (instance) => {
    const Component = instance.type;
    instance.render = Component.render;
    // if (!Component.render) {
    //   instance.render = Component.render
    // }
};
let currentInstance = null;
const getCurrentInstance = () => {
    return currentInstance;
};
const setCurrentInstance = (instance) => {
    currentInstance = instance;
};

const provide = (key, value) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { provides } = currentInstance;
        // TS doesn't allow symbol as index type
        provides[key] = value;
    }
};
const inject = (key, defaultValue) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        const parentProvides = parent === null || parent === void 0 ? void 0 : parent.provides;
        if (parentProvides && key in parentProvides) {
            return parentProvides[key];
        }
        else {
            return typeof defaultValue === 'function'
                ? defaultValue()
                : defaultValue;
        }
    }
};

const Fragment = Symbol();
const Text = Symbol();
const createVNode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHLDREN */;
    }
    if (vnode.shapeFlag | 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
};
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}
const createTextVNode = (text) => {
    return createVNode(Text, {}, text);
};

const h = (type, props, children) => {
    return createVNode(type, props, children);
};

const renderSlot = (slots, key, props = {}) => {
    var _a;
    return createVNode(Fragment, {}, (_a = slots === null || slots === void 0 ? void 0 : slots[key]) === null || _a === void 0 ? void 0 : _a.call(slots, props));
};

const createAppAPI = (render) => {
    const createApp = (rootComponent) => {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
    return createApp;
};

const createRenderer = (options) => {
    const { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp, createText: hostCreateText, setElementText: hostSetElementText, } = options;
    const render = (vnode, container) => {
        patch(null, vnode, container, null);
    };
    /**
     *
     * @param n1 老节点
     * @param n2 新节点
     * @param container
     * @param parentComponent
     */
    const patch = (n1, n2, container, parentComponent) => {
        const { type } = n2;
        switch (type) {
            case Fragment: {
                processFragment(n1, n2, container, parentComponent);
                break;
            }
            case Text: {
                processText(n1, n2, container);
                break;
            }
            default: {
                if (n2.shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (n2.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
            }
        }
    };
    const setupRenderEffect = (instance, vnode, container) => {
        effect(() => {
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const prevSubTree = instance.subTree;
                const subTree = instance.render.call(instance.proxy);
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    };
    const processComponent = (n1, n2, container, parentComponent) => {
        mountComponent(n2, container, parentComponent);
    };
    const mountComponent = (vnode, container, parentComponent) => {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    };
    const processElement = (n1, n2, container, parentComponent) => {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    };
    const patchElement = (n1, n2, container) => {
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
    };
    const patchProps = (el, oldProps, newProps) => {
        if (oldProps === newProps)
            return;
        for (const key in newProps) {
            const prevProp = oldProps[key];
            const newProp = newProps[key];
            if (prevProp !== newProp) {
                hostPatchProp(el, key, prevProp, newProp);
            }
        }
        if (oldProps === EMPTY_OBJ)
            return;
        for (const key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null);
            }
        }
    };
    const mountElement = (vnode, container, parentComponent) => {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, props } = vnode;
        const { shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            hostSetElementText(el, children);
        }
        else if (shapeFlag & 8 /* ARRAY_CHLDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        hostInsert(el, container);
    };
    const mountChildren = (vnode, container, parentComponent) => {
        for (const child of vnode.children) {
            patch(null, child, container, parentComponent);
        }
    };
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const text = n2.children;
        const textNode = (n2.el = hostCreateText(text));
        hostInsert(textNode, container);
    }
    return {
        createApp: createAppAPI(render),
    };
};

const renderer = createRenderer({
    createElement(type) {
        return document.createElement(type);
    },
    setElementText(el, text) {
        el.textContent = text;
    },
    insert(el, container) {
        container.appendChild(el);
    },
    createText(text) {
        return document.createTextNode(text);
    },
    patchProp(el, key, prevProp, newProp) {
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, newProp);
        }
        else {
            if (newProp === null || newProp === undefined) {
                el.removeAttribute(key);
            }
            else {
                el.setAttribute(key, newProp);
            }
        }
    },
});
const createApp = (rootComponent) => {
    return renderer.createApp(rootComponent);
};

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this.dep = new Set();
        this._value = convert(value);
        this._rawValue = value;
    }
    get value() {
        if (isTracking()) {
            trackEffects(this.dep);
        }
        return this._value;
    }
    set value(val) {
        if (!hasChanged(this._rawValue, val))
            return;
        this._value = convert(val);
        this._rawValue = val;
        triggerEffects(this.dep);
    }
}
const ref = (raw) => {
    return new RefImpl(raw);
};
const convert = (value) => {
    return isObject(value) ? reactive(value) : value;
};
const isRef = (ref) => {
    var _a;
    return (_a = ref === null || ref === void 0 ? void 0 : ref['__v_isRef']) !== null && _a !== void 0 ? _a : false;
};
const unRef = (ref) => {
    if (isRef(ref))
        return ref.value;
    else
        return ref;
};
const proxyRefs = (objectWithRefs) => {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                target[key].value = value;
                return true;
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
};

class ComputedRefImpl {
    constructor(getter) {
        this._dirty = true;
        this._getter = getter;
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        });
    }
    get value() {
        if (this._dirty) {
            this._dirty = false;
            return (this._value = this._effect.run());
        }
        else {
            return this._value;
        }
    }
}
const computed = (getter) => {
    return new ComputedRefImpl(getter);
};

exports.computed = computed;
exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isReactive = isReactive;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlot = renderSlot;
exports.renderer = renderer;
exports.shallowReadonly = shallowReadonly;
