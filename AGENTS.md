下面是基于你的需求文档、技术文档以及 AGENTS.md 官方格式生成的约束文档。可直接保存为项目根目录的 `AGENTS.md`。

---

# AGENTS.md

本文件为 AI 编码代理（coding agents）提供本项目的专属上下文与约束。README.md 面向人类贡献者，本文件面向代理；两者冲突时，以本文件与用户显式指令为准。靠近被修改文件的 AGENTS.md 优先级更高，用户对话中的显式指令优先级最高。

## 1. 项目概览

- 产品：纯前端 Markdown 笔记应用，左侧编辑、右侧实时预览，笔记数据存于浏览器 LocalStorage。
- 功能：Markdown/GFM 渲染、格式工具栏（字体颜色/字号/字体/高亮）、代码高亮、图片插入、大纲导航、笔记管理、本地持久化。
- 技术栈：React 18 + TypeScript + Vite；Markdown 解析用 `react-markdown`；GFM 用 `remark-gfm`；原始 HTML 用 `rehype-raw` + `rehype-sanitize`；代码高亮用 `react-syntax-highlighter`（Prism）；样式用 Tailwind CSS。
- 形态：零后端、零登录、单页应用。
- 详细需求见 `PRD.md`，架构与模块设计见 `TECH.md`。实现前先读这两份文档，不要凭猜测新增需求。

## 2. 环境要求

- Node.js：>= 18.18（Vite 5 要求），推荐 LTS 版本。
- 包管理器：npm（与 `TECH.md` 保持一致）。**不要**擅自切换为 pnpm/yarn，也不要提交多份 lockfile。
- 浏览器目标：Chrome / Edge / Firefox / Safari 最近两个大版本；支持宽度 >= 375px。
- 仅使用浏览器原生能力：LocalStorage、`crypto.randomUUID()`、`FileReader`、Canvas、剪贴板/拖拽事件。不引入后端、数据库、账号体系或云存储。

## 3. 安装与运行命令

```bash
npm install              # 安装依赖
npm run dev              # 启动开发服务器
npm run build            # 生产构建（tsc + vite build）
npm run preview          # 预览构建产物
npm run lint             # ESLint 检查（若已配置）
```

代理在完成任务前必须至少确认 `npm run build` 通过；涉及逻辑改动时补充运行测试/类型检查。

## 4. 依赖约束

### 4.1 允许的核心依赖

| 用途      | 依赖                                                         | 约束                                            |
| --------- | ------------------------------------------------------------ | ----------------------------------------------- |
| 框架      | react、react-dom                                             | 18.x                                            |
| 语言/构建 | typescript、vite、@vitejs/plugin-react                       | 按 Vite React-TS 模板                           |
| Markdown  | react-markdown                                               | 不新增另一套 Markdown 解析器                    |
| GFM       | remark-gfm                                                   | 表格、任务列表、删除线必需                      |
| HTML      | rehype-raw + rehype-sanitize                                 | 必须走白名单净化，禁止脚本/事件属性/危险协议    |
| 代码高亮  | react-syntax-highlighter + `@types/react-syntax-highlighter` | 使用 Prism 版本（`Prism as SyntaxHighlighter`） |
| 样式      | tailwindcss、postcss、autoprefixer                           | 原子类优先，不新增 CSS-in-JS 库                 |

### 4.2 依赖使用规则

- 新增任何运行时依赖前，先确认现有依赖无法满足；能用手写少量代码解决的，不引入新库。
- 不引入与现有选型重叠的库（如另一套 Markdown 解析器、另一套高亮库、UI 组件库、状态管理库）。
- 需要状态管理时优先用 React 内置 `useState` / `useReducer` / Context，不引入 Redux、Zustand 等。
- 不升级 React 主版本、Vite 主版本或 Tailwind 主版本，除非用户明确要求。
- 新增依赖必须同步更新 `package.json` 与 lockfile，并在提交说明中写明理由。
- 不引入任何会上报数据、埋点或远程请求的依赖；本应用默认不发网络请求。

## 5. 代码风格

### 5.1 TypeScript

- 开启 `strict` 模式，不使用 `any`；确需宽泛类型时用 `unknown` 并收窄。
- 所有导出的函数、组件 Props、数据结构显式标注类型；数据结构统一定义在 `src/types/`。
- 使用 `interface` 描述对象结构，使用 `type` 描述联合/工具类型。
- 禁止非空断言 `!` 滥用；优先用可选链与空值合并处理可能为空的值。
- 不使用 `enum`，用字面量联合类型或 `as const` 对象替代。

### 5.2 格式与命名

- 缩进 2 空格；字符串使用单引号；语句末尾加分号（与 Vite 模板默认 ESLint 规则一致，以仓库 lint 配置为准）。
- 组件文件与组件名使用 PascalCase（`NoteList.tsx`）；Hook 以 `use` 开头（`useNotes.ts`）；工具函数用 camelCase。
- 组件使用函数组件 + Hooks，不使用 class 组件。
- 优先函数式与不可变更新（`map` / `filter` / 展开运算符），不直接修改状态对象或数组。
- 单文件职责单一：组件只负责渲染与事件转发，业务逻辑收敛到 `hooks/`，存储读写收敛到 `utils/storage.ts`。
- 避免深层嵌套三元表达式；复杂分支提前 return。

### 5.3 Tailwind CSS

- 布局与间距一律用 Tailwind 原子类，不写内联 `style`（动态计算值如高亮主题配置除外）。
- 复用度高的类组合可抽为组件或 `@apply`，但不要过度抽象。
- 响应式以 `md` 断点为主：`< md` 上下堆叠，`>= md` 左右分栏。
- 滚动容器遵循 `h-screen` + `min-h-0 flex-1` 模式，避免整页双滚动条。

### 5.4 React 与 react-markdown

- 编辑器为受控组件，`value` + `onChange` 驱动，不直接操作 DOM。
- 预览更新使用 `useDeferredValue` 降低大文档输入时的解析压力。
- `react-markdown` 的自定义渲染统一放在 `MarkdownRenderer`，通过 `components.code` 处理行内代码与代码块分流；不要在多个组件里重复配置。
- 代码块语言取自 `className` 中的 `language-xxx`，取不到时回退为 `text`，不得抛错。
- 格式工具栏的选区操作必须封装为 `utils/markdownEdits.ts` 中的纯函数，组件只负责取值与回调，不要在 JSX 中拼装复杂字符串逻辑。
- 原始 HTML 必须经过 `rehype-sanitize` 白名单；只允许 `md-*` 类名，不得放行 `style`、`script`、事件属性或危险协议。
- 图片插入统一走 `utils/image.ts`：拒绝 SVG，限制源文件大小，压缩后以 data URL 写入；粘贴 / 拖拽也复用同一流程。
- 大纲通过预览 DOM 中的标题生成，id 统一加 `heading-` 前缀，避免与页面其他 id 冲突；点击与滚动高亮不得直接操作笔记数据。

## 6. 数据与存储约束

- LocalStorage key 固定为 `markdown-notes:notes` 与 `markdown-notes:activeId`，不得随意改名。
- 所有读写必须经过 `src/utils/storage.ts`，禁止在组件中直接调用 `localStorage`。
- 读取必须 `try/catch` 并对解析结果做数组校验，失败返回空数组，禁止让脏数据导致白屏。
- 写入失败（隐私模式、超限）必须捕获并给出非阻断提示，不得中断编辑。
- 本地图片以 base64 内嵌在笔记内容中，必须限制单图大小并提示 LocalStorage 容量风险；不得把图片上传到服务器。
- 数据结构变更必须同步更新 `src/types/note.ts` 与 `TECH.md` 中的数据模型章节。
- 不采集、不上传任何用户数据；不引入分析或监控 SDK。

## 7. 测试与验证

- 每次改动后至少运行 `npm run build`，确保类型检查与构建通过。
- 涉及交互的改动，需在浏览器中手动验证：新建/切换/删除/搜索笔记、实时预览、代码高亮、刷新后数据恢复。
- 删除笔记必须保留二次确认；改动删除逻辑时需验证「删除当前笔记后自动选中下一条」。
- 修改存储层时需验证：空 LocalStorage、损坏 JSON、隐私模式三种场景不崩溃。
- 不为了让构建通过而删除或跳过类型检查、lint 规则；修复根因而非屏蔽报错。

## 8. 目录与文件约定

- 遵循 `TECH.md` 的目录结构：`components/`、`hooks/`、`types/`、`utils/`。
- 新增组件放入 `components/`，新增 Hook 放入 `hooks/`，不新建含义重叠的目录。
- 不提交 `dist/`、`node_modules/`、`.env` 等构建产物或本地配置。
- 不删除或重命名 `PRD.md`、`TECH.md`、`AGENTS.md`，如需调整先征求用户确认。

## 9. 范围约束

- 严格按 `PRD.md` 的 P0/P1 与 v1.1 编辑增强范围实现；非目标（账号、同步、协作、云端图片上传、WYSIWYG 富文本、PDF 导出、版本历史）不实现，除非用户明确要求。
- 不擅自扩大范围或「顺手」重构无关模块；发现需要较大改动时先说明方案再动手。
- 不引入后端接口、不发起网络请求、不添加登录流程。

## 10. 提交与交付

- 提交前运行 `npm run build`（及已配置的 `npm run lint`），全绿再提交。
- 提交信息使用祈使句、说明「做了什么」，涉及依赖变更时写明新增依赖及理由。
- 完成任务时简要说明：改了哪些文件、验证了哪些场景、是否有未覆盖的风险。
- 遇到与本文件或 `PRD.md`/`TECH.md` 冲突的需求，先指出冲突并请用户确认，不自行取舍。

---

几点说明：文档中的 lint 脚本、格式化细节（单引号/分号）以你仓库实际 ESLint 配置为准，若尚未配置可在 `.eslintrc` 中固定后再同步本文件；包管理器我按 `TECH.md` 统一为 npm，若你更想用 pnpm，把第 2、3 节和命令整体替换即可。需要我再补一份精简版（只保留命令、风格、范围三节）放在子目录，或加一份 `README.md` 快速启动说明吗？
