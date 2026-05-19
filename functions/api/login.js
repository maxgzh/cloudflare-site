export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { username, password } = await request.json();
    // 从数据库中查找这个用户
    const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: "账号不存在，请先注册！" }), { status: 400 });
    }
    if (user.password !== password) {
      return new Response(JSON.stringify({ error: "密码错误！" }), { status: 400 });
    }
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "服务器错误" }), { status: 500 });
  }
}
