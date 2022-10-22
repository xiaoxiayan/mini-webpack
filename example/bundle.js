// 生成的 bundle js
// 多个chunk的 funciton
// 为了处理 import 不在顶层，需要 用 babel转换插件，转成COMMONjs

// 一个 require 函数， 有个对应的 文件： 对应函数




// 立即执行函数

(function (moudels) {
  function require(id) {
    const [fn, mapping] = moudels[id]
    function localRequire(filePath) {
      const id = mapping[filePath]
      return require(id)
    }

    const module = {
      exports: {}
    }
    fn(localRequire, module, module.exports)

    return module.exports
  }

  require(1)
})({
  0: [function (require, module, exports) {
    function foo() {
      console.log('foo.js')
    }
    module.exports = {
      foo
    }
  }, {}],
  1: [function (require, module, exports) {
    const { foo } = require("./foo.js")
    console.log('main.js')
    foo()
  }, {
    './foo.js': 0
  }]
})