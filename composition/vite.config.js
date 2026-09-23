import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    // Vue 官方调试面板：把组件树/数据直接显示在页面上，不用装浏览器扩展
    // 只在 npm run dev 时生效，npm run build 打包上线时不会进生产包
    vueDevTools({
      // 在调试面板里点组件，可以直接用 VSCode 打开对应的 .vue 源文件
      launchEditor: 'code'
    })
  ],
  server: {
    // 显式绑定 IPv4 回环：不写 host 时 Node 可能只绑到 IPv6 的 [::1]，
    // 导致 http://127.0.0.1:5173 连不上
    host: '127.0.0.1',
    port: 5173,
    open: true
  }
})
