export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get("username"); // 听听看是谁在要文件

  if (!username) {
    return new Response(JSON.stringify({ error: "未知的用户请求" }), { status: 400 });
  }

  try {
    // 🔒 核心防御：WHERE username = ? 保证了用户只能捞出来属于自己的那行数据！
    const { results } = await env.DB.prepare(
      "SELECT id, file_name, file_type, file_data, created_at FROM user_files WHERE username = ? ORDER BY created_at DESC"
    ).bind(username).all();
    
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
