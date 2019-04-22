function isFunction(obj) {
    return typeof obj === 'function';
}

function isString(obj) {
    return typeof obj === 'string';
}

/** 事件委托 */
class Delegate {
    constructor(vnode) {
        this.vnode = vnode;
        this._map = {};
        // 用来给委托任务编号，事件触发时按顺序执行
        this._index = 0;
    }
    /**
     * 将事件处理函数添加到当前节点
     * @param {string} events 事件名，多个事件用空格分隔
     * @param {string} selector 选择器
     * @param {function} handler 事件处理函数
     */
    on(events, selector, handler) {
        let { _map, vnode } = this;
        if (isFunction(selector)) {
            handler = selector;
            selector = null;
        }
        if (isString(events) && isFunction(handler)) {
            let index = this._index++;
            if (!isString(selector)) {
                selector = null;
            }
            events.split(/\s+/).forEach(eventType => {
                if (eventType) {
                    if (!_map[eventType]) {
                        _map[eventType] = [];
                        // 事件名采用驼峰形式
                        let eventBindName = 'on' + eventType.replace(/^\w/, w => w.toUpperCase());
                        let oldHandler = vnode.attributes[eventBindName];
                        if (!isFunction(oldHandler)) {
                            oldHandler = null;
                        }
                        vnode.attributes[eventBindName] = event => {
                            if (oldHandler) {
                                oldHandler(event);
                            }
                            this.exec(eventType, event);
                        };
                    }
                    _map[eventType].push({ index, selector, handler });
                }
            });
        }
        return this;
    }
    /**
     * 执行附加到节点上的指定事件的所有处理函数
     * @param {string} eventType
     * @param {Event} event
     */
    exec(eventType, event) {
        let root = event.currentTarget;
        let target = event.target;
        let execList = [];
        let list = this._map[eventType];
        // 查找子元素命中的委托
        while (target && root && target != root) {
            let matches = {};
            for (let index = 0; index < list.length; index++) {
                let { selector, handler } = list[index];
                if (selector) {
                    if (matches[selector] == null) {
                        let finds = root.querySelectorAll(selector);
                        matches[selector] = Array.prototype.indexOf.call(finds, target) > -1;
                    }
                    if (matches[selector]) {
                        execList.push({
                            target,
                            handler,
                            event: Object.assign({}, event, { target })
                        });
                    }
                }
            }
            target = target.parentElement || root;
        }
        // 查找当前元素命中的委托
        list.forEach(({ selector, handler }) => {
            if (!selector) {
                execList.push({ target: root, handler, event });
            }
        });
        // 依次执行命中的委托
        execList.sort((a, b) => a.index - b.index);
        while (execList.length) {
            let { target, handler, event } = execList.shift();
            // 在事件处理函数中返回 false 时，停止后续的委托处理
            if (handler.call(target, event) === false) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }
    }
}

//#region 通过vnode钩子函数解析on属性，并进行事件委托
const { options } = preact;
let oldHook = options.vnode; // 保存之前的钩子函数
options.vnode = vnode => {
    // 设置了on属性时，创建Delegate对象进行委托
    let { attributes } = vnode;
    if (attributes.on && isFunction(attributes.on)) {
        attributes.on(new Delegate(vnode));
        delete attributes.on;
    }
    // 执行之前的钩子函数
    if (oldHook) {
        oldHook(vnode);
    }
};
//#endregion

export default Delegate;
