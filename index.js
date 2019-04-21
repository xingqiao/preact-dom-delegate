/**
 * 点击上报
 *
 * 使用说明
    ### 加载组件
    - 源码 import 导入
        ```javascript
        // 注意使用相对路径
        import '/y.qq.com/component/m/QMEvent/src/delegate.js';
        ```
    - 或者直接引入js文件
        ```html
        <script src="//y.qq.com/component/m/QMEvent/delegate.js?max_age=2592000"></script>
        ```

    ### 设置委托

    在 JSX DOM 上设置 `on` 属性，值为委托方法，如：

    ```jsx
    <div
        on={delegate =>
            delegate
                .on('tap', 'i', function(e) {
                    console.log('0 .mod_play_cover', this, e);
                })
                .on('tap', '.mod_play_cover', function(e) {
                    console.log('1 .mod_play_cover', this, e);
                    return false;
                })
                .on('tap', function(e) {
                    console.log('2 this', this, e);
                })
                .on('tap', '.mod_app__btn', function(e) {
                    console.log('3 .mod_app__btn', this, e);
                })
                .on('tap', function(e) {
                    console.log('4 this', this, e);
                })
        }
    >
        ……
    </div>
    ```

    - 执行顺序为从点击元素开始，按绑定顺序执行当前元素要响应的事件，然后冒泡到父节点，按照同样逻辑处理
    - `return false` 可以阻止后续事件执行
    - 支持的事件包括：
        - tap
        - click
        - touchstart
        - touchmove
        - touchend
 */

/** 初始化委托 */
function initDelegate(vnode, bindEvent) {
    if (typeof bindEvent !== 'function') {
        return false;
    }
    let events = {
        tap: { event: 'onTap', list: [] },
        click: { event: 'onClick', list: [] },
        touchstart: { event: 'onTouchStart', list: [] },
        touchmove: { event: 'onTouchMove', list: [] },
        touchend: { event: 'onTouchEnd', list: [] }
    };
    bindEvent({
        on: function(eventName, selector, action) {
            if (typeof eventName === 'string') {
                if (!action) {
                    action = selector;
                    selector = null;
                }
                if (typeof action === 'function') {
                    if (typeof selector !== 'string') {
                        selector = '';
                    }
                    eventName
                        .trim()
                        .split(/\s+/)
                        .forEach(item => {
                            if (events[item]) {
                                events[item].list.push({ selector, action });
                            }
                        });
                }
            }
            return this;
        }
    });

    for (const key in events) {
        const item = events[key];
        if (item.list && item.list.length) {
            bindDelegate(vnode.attributes, item);
        }
    }
}

/** 绑定委托事件 */
function bindDelegate(attrs, { event, list }) {
    let oldEvent = attrs[event];
    attrs[event] = e => {
        if (oldEvent) {
            oldEvent(e);
        }
        execDelegate(e, list);
    };
}

/** 执行委托事件 */
function execDelegate(e, list) {
    let root = e.currentTarget;
    let target = e.target;
    let execList = [];
    // 查找子元素命中的委托
    while (target && root && target != root) {
        let matches = {};
        for (let index = 0; index < list.length; index++) {
            let { selector, action } = list[index];
            if (selector) {
                if (matches[selector] == null) {
                    let finds = root.querySelectorAll(selector);
                    matches[selector] = Array.prototype.indexOf.call(finds, target) > -1;
                }
                if (matches[selector]) {
                    execList.push({
                        elem: target,
                        action,
                        event: M.extend({}, e, { target })
                    });
                }
            }
        }
        target = target.parentElement || root;
    }
    // 查找当前元素命中的委托
    list.forEach(({ selector, action }) => {
        if (!selector) {
            execList.push({ elem: root, action, event: e });
        }
    });
    if (execList.length) {
        while (execList.length) {
            let { elem, action, event } = execList.shift();
            let ret = action.call(elem, event);
            if (ret === false) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }
}

const { options } = preact;
let oldHook = options.vnode; // 保存之前的钩子函数
options.vnode = vnode => {
    // 有 data-tj 属性时进行上报
    let attrs = vnode.attributes;
    let bindEvent = attrs && attrs.on;
    if (bindEvent) {
        delete attrs.on;
        initDelegate(vnode, bindEvent);
    }

    // 执行之前的钩子函数
    if (oldHook) {
        oldHook(vnode);
    }
};

export default (QMEvent => {
    return QMEvent;
})(window.QMEvent || {});
