# 张向航个人站点 - Vue 3 重构版

这是一个使用 Vue 3 Composition API 重构的个人网站项目。

## 项目结构

```
myvue/composition/
├── index.html              # HTML 入口文件
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite 构建配置
└── src/
    ├── main.js             # 应用入口
    ├── style.css           # 全局样式（保持原 HTML 样式）
    ├── App.vue             # 根组件
    └── components/
        ├── AuthView.vue    # 登录/注册组件
        ├── IntroSection.vue # 个人介绍板块组件
        ├── SliderSection.vue # 轮播图组件
        └── MessageSection.vue # 留言板组件
```

## 功能说明

1. **登录/注册系统**
   - 支持用户注册新账号
   - 登录状态通过 localStorage 管理
   - 默认初始账号密码均为 `123456`

2. **个人介绍板块**
   - 展示头像、姓名、学校等个人信息
   - 深色主题卡片设计
   - 悬停动画效果

3. **轮播图展示**
   - 5 张幻灯片自动播放
   - 支持手动切换和指示点点击
   - 鼠标悬停时暂停播放

4. **留言板 + AI 回复**
   - 发布留言（昵称 + 内容）
   - 调用通义千问 API 自动生成回复
   - 支持删除留言（带删除动画）

## 开发步骤

1. 安装依赖：
```bash
cd C:\myvue\composition
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

## 使用说明

- 打开浏览器访问 `http://localhost:5173`
- 首次进入使用默认账号密码登录（123456/123456）
- 可以注册新账号，账号信息会保存在 localStorage 中
- 在留言板发布消息后会自动触发 AI 回复
- 点击"退出登录"可以退出当前会话

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Composition API** - 更灵活的代码组织方式
- **Vite** - 新一代前端构建工具
- **localStorage** - 浏览器本地存储

## 注意事项

- 原始图片文件 `image_821241156679754.png` 需要放在 `src/` 目录下
- AI 回复功能使用了阿里云通义千问 API Key
- 所有数据存储在浏览器 localStorage 中，不会上传到服务器
