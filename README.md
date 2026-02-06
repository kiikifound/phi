# 哲学派别测试（GitHub Pages 一键部署）

## 1) 本地运行
```bash
npm install
npm run dev
```

## 2) 生成静态站点
```bash
npm run build
npm run preview
```

## 3) 部署到 GitHub Pages（推荐：Actions 自动部署）

### 步骤
1. 在 GitHub 新建仓库（建议 public），把本项目文件全部推到 `main` 分支。
2. 进入仓库 Settings → Pages：
   - Source 选择 **GitHub Actions**
3. 推送后等待 Actions 完成部署。
4. Pages 链接会出现在 Actions 的部署输出里，也可在 Settings → Pages 查看。

### 说明
- 本项目 `vite.config.ts` 会在 GitHub Actions 环境下自动读取仓库名并设置正确的 `base` 路径，因此不需要手动改配置。
- 测试结果默认保存在浏览器 `localStorage`（匿名、仅本机）。

## 4) 内容与题库修改
- 题目：`src/data/questions.json`
- 派别与结果文案：`src/data/schools.json`
- 派别百科（更详细）：`src/data/encyclopedia.json`
- 派别理想向量（5 轴）：`src/data/ideals.json`


### 为什么使用 Hash 路由
- GitHub Pages 默认不支持 SPA 的路径回退（例如 /result 会 404）。
- 本项目使用 HashRouter（/#/result）避免空白页与刷新 404。

