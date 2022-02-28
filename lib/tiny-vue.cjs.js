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
    $props: (i) => i.props,
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
        next: null,
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
        update: () => null,
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
    var _a;
    const vnode = {
        type,
        props,
        children,
        el: null,
        key: (_a = props === null || props === void 0 ? void 0 : props.key) !== null && _a !== void 0 ? _a : null,
        shapeFlag: getShapeFlag(type),
        component: null,
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

const shouldUpdateComponent = (n1, n2) => {
    const { props: prevProps } = n1;
    const { props: nextProps } = n2;
    for (const key in nextProps) {
        if (nextProps[key] !== (prevProps === null || prevProps === void 0 ? void 0 : prevProps[key])) {
            return true;
        }
    }
    return false;
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
    const { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp, createText: hostCreateText, setElementText: hostSetElementText, remove: hostRemove, } = options;
    const render = (vnode, container) => {
        patch(null, vnode, container, null, null);
    };
    /**
     *
     * @param n1 老节点
     * @param n2 新节点
     * @param container
     * @param parentComponent
     */
    const patch = (n1, n2, container, parentComponent, anchor) => {
        const { type } = n2;
        switch (type) {
            case Fragment: {
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            }
            case Text: {
                processText(n1, n2, container, anchor);
                break;
            }
            default: {
                if (n2.shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (n2.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
            }
        }
    };
    const setupRenderEffect = (instance, vnode, container) => {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance, null);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                //更新组件本身
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                //更新他的子树
                const prevSubTree = instance.subTree;
                const subTree = instance.render.call(instance.proxy);
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, null);
            }
        });
    };
    const processComponent = (n1, n2, container, parentComponent) => {
        if (!n1) {
            mountComponent(n2, container, parentComponent);
        }
        else {
            updateComponent(n1, n2);
        }
    };
    const mountComponent = (vnode, container, parentComponent) => {
        const instance = (vnode.component = createComponentInstance(vnode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    };
    const processElement = (n1, n2, container, parentComponent, anchor) => {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    };
    const unmountChildren = (children) => {
        const n = children.length;
        for (let i = 0; i < n; ++i) {
            const el = children[i].el;
            if (el)
                hostRemove(el);
        }
    };
    const patchChildren = (n1, n2, container, parentComponent, anchor) => {
        const prevShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            //这个分支处理以下两种请款
            //(1). 之前是数组，现在是文字
            //(2). 之前是文字，现在还是文字
            if (prevShapeFlag & 8 /* ARRAY_CHLDREN */) {
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(n2.children, container, parentComponent, anchor);
            }
            else {
                // array diff array
                patchKeyedChildren(n1.children, n2.children, container, parentComponent, anchor);
            }
        }
    };
    const patchKeyedChildren = (c1, c2, container, parentComponent, parentAnchor) => {
        const l1 = c1.length;
        const l2 = c2.length;
        let i = 0;
        let e1 = l1 - 1;
        let e2 = l2 - 1;
        //左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            ++i;
        }
        //右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            --e1;
            --e2;
        }
        if (i > e1) {
            //新节点比老节点多，需要创建
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                for (; i <= e2; ++i) {
                    patch(null, c2[i], container, parentComponent, anchor);
                }
                return;
            }
        }
        else if (i > e2) {
            //新节点数量比老节点少，需要删除
            for (; i <= e1; ++i) {
                hostRemove(c1[i].el);
            }
        }
        else {
            let s1 = i;
            let s2 = i;
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            const keyToNewIndex = new Map();
            const newIndexToOldIndex = Array.from({
                length: toBePatched,
            }).fill(0);
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = s2; i <= e2; ++i) {
                const key = c2[i].key;
                if (key !== null) {
                    keyToNewIndex.set(key, i);
                }
            }
            for (let i = s1; i <= e1; ++i) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndex.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; ++j) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndex[newIndex - s2] = i + 1;
                    ++patched;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                }
            }
            const increasingNewIndexSequence = moved ? getLIS(newIndexToOldIndex) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; --i) {
                const newIndex = i + s2;
                const nextChild = c2[newIndex];
                const anchor = newIndex + 1 < l2 ? c2[newIndex + 1].el : null;
                if (newIndexToOldIndex[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j <= 0 ||
                        newIndexToOldIndex[i] !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        --j;
                    }
                }
            }
        }
    };
    const isSameVNodeType = (n1, n2) => {
        return n1.type === n2.type && n1.key === n2.key;
    };
    const patchElement = (n1, n2, container, parentComponent, anchor) => {
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
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
    const mountElement = (vnode, container, parentComponent, anchor) => {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, props } = vnode;
        const { shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            hostSetElementText(el, children);
        }
        else if (shapeFlag & 8 /* ARRAY_CHLDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        hostInsert(el, container, anchor);
    };
    const mountChildren = (children, container, parentComponent, anchor) => {
        for (const child of children) {
            patch(null, child, container, parentComponent, anchor);
        }
    };
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    const updateComponent = (n1, n2) => {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    };
    const processText = (n1, n2, container, anchor) => {
        const text = n2.children;
        const textNode = (n2.el = hostCreateText(text));
        hostInsert(textNode, container, anchor);
    };
    return {
        createApp: createAppAPI(render),
    };
};
const getLIS = (nums) => {
    //通过二分查找插入位置动态构建出来的最长递增子序列
    //tails[i]表示长度为i的最长递增子序列，该序列最后的一个数字的最小值为tails[i]
    const tails = [];
    let len = 1;
    tails[1] = nums[0];
    for (let i = 1; i < nums.length; ++i) {
        if (nums[i] > tails[len]) {
            tails[++len] = nums[i];
        }
        else {
            //左边从1开始tails[0]为未定义行为
            let l = 1;
            let r = len;
            let pos = 0;
            while (l <= r) {
                const mid = (l + r) >> 1;
                if (tails[mid] < nums[i]) {
                    pos = mid;
                    l = mid + 1;
                }
                else {
                    r = mid - 1;
                }
            }
            tails[pos + 1] = nums[i];
        }
    }
    return tails;
};
const updateComponentPreRender = (instance, next) => {
    instance.props = next.props;
    instance.vnode = next;
    instance.next = null;
};

const renderer = createRenderer({
    createElement(type) {
        return document.createElement(type);
    },
    setElementText(el, text) {
        el.textContent = text;
    },
    insert(el, container, anchor) {
        container.insertBefore(el, anchor);
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
    remove(el) {
        el.remove();
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
