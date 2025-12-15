<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 情绪急救 (Emotional First Aid)

一个基于 AI 的情绪管理应用，帮助你记录和管理日常情绪，提供个性化的情绪支持建议。

在 AI Studio 查看此应用：https://ai.studio/apps/drive/1bd9tX-BxuyleGzRqjVOI_9AK5c9hniWf

---

## 📋 功能特性

- 🎭 情绪选择和记录
- 🎤 语音输入支持
- 📅 日历视图查看历史记录
- 🤖 基于 Google Gemini AI 的智能情绪分析
- 💡 个性化的情绪支持建议

---

## 🚀 本地部署指南

### 第 1 步：检查前置条件

在开始之前，请确保你的电脑已安装 **Node.js**。

**如何检查是否已安装 Node.js：**

打开命令行工具（PowerShell 或 CMD），运行以下命令：

```bash
node --version
npm --version
```

如果显示版本号（如 `v18.x.x` 或更高），说明已安装成功。

**如果没有安装 Node.js：**

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载并安装 LTS（长期支持）版本
3. 安装完成后重新打开命令行工具验证

---

### 第 2 步：安装项目依赖

在项目根目录下打开命令行工具，运行以下命令：

```bash
npm install
```

**说明：** 这个命令会自动下载并安装项目所需的所有依赖包（包括 React、Vite、Tailwind CSS 等），依赖包会保存在 `node_modules` 文件夹中。

⏱️ 这个过程可能需要几分钟，请耐心等待。

---

### 第 3 步：配置 Gemini API 密钥

本应用使用 Google 的 Gemini AI，因此需要配置 API 密钥。

#### 3.1 获取 API 密钥

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 使用你的 Google 账号登录
3. 点击 **"Create API Key"** 创建新的 API 密钥
4. 复制生成的 API 密钥（类似：`AIzaSyC1234567890abcdefg...`）

#### 3.2 创建配置文件

在项目根目录下创建一个名为 `.env.local` 的文件。

**在 Windows 上创建 .env.local 文件的方法：**

**方法 1：使用 PowerShell（推荐）**
```powershell
# 在项目根目录运行
New-Item -Path .env.local -ItemType File
```

**方法 2：使用 Cursor/VS Code**
- 在编辑器中点击"新建文件"
- 文件名输入：`.env.local`
- 按回车创建

**方法 3：使用记事本**
- 打开记事本，点击"另存为"
- 文件名输入：`".env.local"`（包含双引号）
- 保存类型选择："所有文件(*.*)"

#### 3.3 配置文件内容

在 `.env.local` 文件中添加以下内容：

```bash
# Gemini API 密钥配置
# 请将下面的 YOUR_API_KEY_HERE 替换为你从 Google AI Studio 获取的实际 API 密钥

GEMINI_API_KEY=YOUR_API_KEY_HERE
API_KEY=YOUR_API_KEY_HERE
VITE_API_KEY=YOUR_API_KEY_HERE
```

**重要提示：**
- 将 `YOUR_API_KEY_HERE` 替换为你的实际 API 密钥
- 密钥两边不要加引号或空格
- ⚠️ **不要将此文件提交到 Git 或分享给他人**

---

### 第 4 步：启动应用

配置完成后，在命令行中运行：

```bash
npm run dev
```

**成功启动后，你会看到类似输出：**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 第 5 步：在浏览器中访问

打开你的浏览器，访问：

```
http://localhost:5173/
```

现在你应该能看到应用正常运行了！🎉

**停止应用：** 在命令行中按 `Ctrl + C`

---

## 🛠️ 其他可用命令

```bash
# 启动开发服务器（支持热重载）
npm run dev

# 构建生产版本（输出到 dist 文件夹）
npm run build

# 预览生产构建版本
npm run preview
```

---

## 📁 项目结构

```
Emotional-First-Aid-main/
├── App.tsx                    # 主应用组件
├── components/                # React 组件目录
│   ├── CalendarView.tsx      # 日历视图组件
│   ├── EmotionSelector.tsx   # 情绪选择器组件
│   ├── FinalCard.tsx         # 结果卡片组件
│   └── VoiceInput.tsx        # 语音输入组件
├── services/
│   └── geminiService.ts      # Gemini AI 服务
├── constants.ts               # 常量定义
├── types.ts                   # TypeScript 类型定义
├── package.json               # 项目依赖配置
├── vite.config.ts            # Vite 构建配置
├── tsconfig.json             # TypeScript 配置
└── .env.local                # 环境变量（需要手动创建）
```

---

## ❓ 常见问题

### Q1: 运行 `npm install` 时速度很慢怎么办？

可以尝试使用国内镜像源：

```bash
npm install --registry=https://registry.npmmirror.com
```

### Q2: 提示 "npm: command not found" 错误

说明 Node.js 没有正确安装或环境变量未配置。请重新安装 Node.js 并重启命令行工具。

### Q3: 应用启动了但功能不正常

1. 检查浏览器控制台（按 F12）是否有错误信息
2. 确认 `.env.local` 文件中的 API 密钥配置正确
3. 确认 API 密钥有效且未超出使用限制

### Q4: 如何修改应用运行的端口？

在 `.env.local` 文件中添加：

```bash
PORT=3000
```

或在启动时指定：

```bash
npm run dev -- --port 3000
```

### Q5: .env.local 文件应该提交到版本控制吗？

❌ **不应该！** 这个文件包含敏感的 API 密钥，应该被 `.gitignore` 忽略。每个开发者应该有自己的 `.env.local` 文件。

---

## 🔒 安全提示

- ⚠️ 永远不要将 `.env.local` 文件提交到 Git
- ⚠️ 不要在代码中硬编码 API 密钥
- ⚠️ 不要公开分享你的 API 密钥
- ✅ 如果密钥泄露，立即到 Google AI Studio 重新生成

---

## 📚 技术栈

- **前端框架：** React 19
- **构建工具：** Vite 5
- **样式：** Tailwind CSS
- **AI 服务：** Google Gemini AI
- **语言：** TypeScript

---

## 📞 获取帮助

如果在部署过程中遇到任何问题：

1. 检查本 README 的常见问题部分
2. 查看浏览器控制台的错误信息
3. 确认所有步骤都正确执行
4. 查阅 [Vite 文档](https://vitejs.dev/) 和 [React 文档](https://react.dev/)

---

## 📄 许可证

本项目仅供学习和个人使用。

---

**祝你使用愉快！如有问题欢迎反馈。** 😊
