import ReactReconciler from 'react-reconciler';
import { createNode, appendChildNode, removeChildNode, updateNode } from './dom';

const rootHostContext = {};
const childHostContext = {};

const hostConfig = {
    // schedulePassiveEffects,
    // cancelPassiveEffects,
    now: Date.now,
    getRootHostContext: () => {
        return rootHostContext;
    },
    prepareForCommit: () => {},
    resetAfterCommit: () => {},
    getChildHostContext: () => {
        return childHostContext;
    },
    shouldSetTextContent: (_type: unknown, _props: unknown) => {
        return false;
        // return typeof props.children === 'string' || typeof props.children === 'number';
    },
    createInstance: createNode,
    createTextInstance: () => {},
    // eslint-disable-next-line no-unused-vars
    resetTextContent: (_node: unknown) => {},
    getPublicInstance: (instance: unknown) => instance,
    appendInitialChild: appendChildNode,
    appendChild: appendChildNode,
    insertBefore: appendChildNode,
    finalizeInitialChildren: () => false,
    supportsMutation: true,
    appendChildToContainer: appendChildNode,
    insertInContainerBefore: appendChildNode,
    removeChildFromContainer: removeChildNode,
    prepareUpdate: () => true,
    commitUpdate: updateNode,
    // eslint-disable-next-line no-unused-vars
    commitTextUpdate: (_node: unknown, _oldText: unknown, _newText: unknown) => {},
    removeChild: removeChildNode,
    shouldDeprioritizeSubtree: () => false,
    scheduleDeferredCallback: () => {},
    cancelDeferredCallback: () => {},
    setTimeout: () => {},
    clearTimeout: () => {},
    noTimeout: () => {},
    isPrimaryRenderer: false,
    supportsPersistence: false,
    supportsHydration: false,
};

export const reactReconciler = ReactReconciler(hostConfig);