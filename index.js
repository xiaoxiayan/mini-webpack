// 图 -》 graph
// 1、 内容
// 2、 依赖关系
import fs from "fs"
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import path from 'path'
import ejs from 'ejs' // 生成对应的chunk
import { transformFromAst } from "@babel/core" // 把ast树 ，改成对应的预设代码
let id = 0
function createAsset(filePath) {
  // 1、 读取 moudel 内容
  // 使用 @babel/parser 插件 读取文件，生成对应的 ast语法树，
  // 使用 @babel/traverse 去解析 ast树，获取我们想要的内容
  const source = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })
  // 2、 获取依赖关系
  const ast = parser.parse(source, {
    sourceType: "module"
  })
  const deps = []
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      // 获取到 node 里面的 source
      deps.push(node.source.value)
    }
  })

  const { code } = transformFromAst(ast, null, {
    presets: ["env"] // 预设用 env 来转换 ESM to COMMON. 需要一个 babel-preset-env
  })
  return {
    filePath,
    code,
    deps,
    mapping: {},
    id: id++
  }
}


const filePath = './example/main.js'


function createGraph() {
  const mainAsset = createAsset(filePath)
  // 利用队列的方式 递归里面的依赖文件
  const queue = [mainAsset]
  for (const asset of queue) {
    asset.deps.forEach(relativePath => {
      // 通过path 处理相对路径
      const child = createAsset(path.resolve("./example", relativePath))
      asset.mapping[relativePath] = child.id
      queue.push(child)
    });

  }
  return queue
}

// 生成 chunk关系对象
const graph = createGraph()


// 读取chunk对象生成 bundlejs
function build(graph) {
  const template = fs.readFileSync('./bundle.ejs', { encoding: 'utf-8' })

  const data = graph.map((asset) => {
    const { id, code, mapping } = asset
    return {
      id,
      code,
      mapping
    }
  })
  const code = ejs.render(template, { data })
  console.log(data, '===code')
  fs.writeFileSync('./dist/bundle.js', code)
}

build(graph)
