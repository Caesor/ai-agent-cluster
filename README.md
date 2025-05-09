# AI Agent集群可视化系统

滴灌通澳门交易所AI Agent集群的3D可视化界面，展示了三层椭球形的Agent结构，包括内层基础服务、中层专业支持和外层增值服务。

## 特性

- 3D椭球形展示三层Agent结构
- 交互式界面，可点击Agent图标查看详情
- 模拟聊天功能
- 科技感强的界面设计
- 响应式设计，适配不同屏幕尺寸

## 技术栈

- Three.js - 3D渲染和动画
- GSAP - 高级动画效果
- Tailwind CSS - 样式框架
- 原生JavaScript - 交互逻辑

## 访问地址

本项目已部署到GitHub Pages，可通过以下地址访问：

```
https://caesor.github.io/ai-agent-cluster/
```

## 本地运行

1. 克隆项目到本地
   ```
   git clone https://github.com/caesor/ai-agent-cluster.git
   ```

2. 进入项目目录
   ```
   cd ai-agent-cluster
   ```

3. 使用任意HTTP服务器启动项目，例如：
   ```
   python3 -m http.server 8000
   ```
   或
   ```
   npx serve
   ```

4. 在浏览器中访问 `http://localhost:8000`

## 部署到GitHub Pages

本项目已配置为使用GitHub Pages进行部署。每次推送到`gh-pages`分支时，项目会自动部署。

### 手动部署步骤

1. 确保你的更改已提交到`main`分支
2. 切换到`gh-pages`分支：`git checkout gh-pages`
3. 合并更改：`git merge main`
4. 推送到GitHub：`git push origin gh-pages`

## 许可证

MIT