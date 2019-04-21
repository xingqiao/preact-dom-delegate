# preact-dom-delegate

[![NPM Version](https://img.shields.io/npm/v/preact-dom-delegate.svg?style=flat-square)](https://www.npmjs.com/package/preact-dom-delegate)
[![NPM Downloads](https://img.shields.io/npm/dm/preact-dom-delegate.svg?style=flat-square)](https://www.npmjs.com/package/preact-dom-delegate)

> 实现 preact 的 dom 事件委托

未完成，暂时先提交

## Install

```bash
$ npm i -S preact-dom-delegate
```

## How it works

### Source:

```js
// index.js
import 'preact-dom-delegate';

class App extends Component {
    render() {
        let { time } = this.state;
        return (
            <article
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
                <header>preact-dom-delegate</header>
                <section>
                    <span>{time ? time.toLocaleString() : ''}</span>
                </section>
                <footer>
                    <a href="https://github.com/xingqiao">@xingqiao</a>
                </footer>
            </article>
        );
    }
}

render(<App />, document.body);
```

### Build:

执行命令 `parcel build index.html`

> 只有在 `parcel build` 操作或者生产环境（`NODE_ENV = 'production'`） 的情况下会自动进行内联操作

### Output:

```html
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>preact-dom-delegate</title>
        <style>
            footer,
            header {
                padding: 2em;
                background: #16f;
                color: #fff;
            }
            section {
                padding: 2em;
                background: #fff;
                color: #16f;
            }
        </style>
    </head>
    <body>
        <script src="https://cdn.jsdelivr.net/npm/preact/dist/preact.min.js"></script>
        <script>
            parcelRequire=function(e,t,n,r){/* 代码太长，省略…… */},{"@babel/runtime/helpers/classCallCheck":"0fcM","@babel/runtime/helpers/createClass":"P8NW","@babel/runtime/helpers/possibleConstructorReturn":"0421","@babel/runtime/helpers/getPrototypeOf":"UJE0","@babel/runtime/helpers/inherits":"d4H2",preact:"OmAK"}]},{},["Focm"]);
        </script>
    </body>
</html>
```
