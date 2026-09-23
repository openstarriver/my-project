/* /api/chat —— 转发到通义千问的服务端函数。
   浏览器只请求这个地址，API Key 只存在 Vercel 的环境变量里，不下发到前端。

   原来这三处都没兜住，任何一处都会让访客直接看到一段浏览器自带的报错页：
     1. 没判请求方法   —— GET 进来时 req.body 是 undefined，
                          JSON.stringify(undefined) 得到 undefined，
                          等于对着上游发了一个空 body
     2. 没判环境变量   —— BASE_URL 没配时会拼出 "undefined/chat/completions"，
                          fetch 直接抛错，函数 500
     3. 没判响应是 JSON —— 上游偶尔会返回一页 HTML（网关超时、限流页之类），
                          response.json() 解析失败，同样抛出去

   所以这里全部收进 try/catch，并且无论走哪条分支都回 JSON，
   保证前端拿到的结构始终一致。 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: { message: '只支持 POST 请求' } })
  }

  const apiKey = process.env.API_KEY
  const baseUrl = process.env.BASE_URL

  if (!apiKey || !baseUrl) {
    return res.status(500).json({ error: { message: '服务端缺少 API_KEY 或 BASE_URL 环境变量' } })
  }

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body ?? {})
    })

    // 先当文本读回来、再自己解析：上游返回的不是 JSON 时这里不会抛，
    // 而是降级成一条看得懂的报错
    const text = await upstream.text()

    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: { message: `上游返回了非 JSON 内容（HTTP ${upstream.status}）` } }
    }

    return res.status(upstream.status).json(data)
  } catch (err) {
    return res.status(502).json({ error: { message: `请求上游失败：${err.message}` } })
  }
}
