export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "账号和密码不能为空" }), { status: 400 });
    }
    // 把数据插入到真正的云端数据库
    await env.DB.prepare("INSERT INTO users (username, password) VALUES (?, ?)").bind(username, password).run();
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "该账号已被注册！" }), { status: 400 });
  }
}
