export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get("username"); 
  const folder_path = url.searchParams.get("folder_path") || '/'; // 获取前端想看哪个文件夹

  if (!username) return new Response(JSON.stringify({ error: "未登录" }), { status: 400 });

  try {
    // 🔒 核心逻辑：只查属于这个用户，且在指定路径下的文件/文件夹
    const { results } = await env.DB.prepare(
      "SELECT id, file_name, file_type, file_data, created_at, folder_path FROM user_files WHERE username = ? AND folder_path = ? ORDER BY file_type DESC, created_at DESC"
    ).bind(username, folder_path).all();
    
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
