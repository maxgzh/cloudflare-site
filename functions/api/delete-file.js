export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { id, username } = await request.json();
    
    if (!id || !username) {
      return new Response(JSON.stringify({ success: false, error: "参数不完整" }), { status: 400 });
    }

    // 🔒 核心防御：必须同时匹配 id 和 username，防止黑客乱删别人的文件
    await env.DB.prepare(
      "DELETE FROM user_files WHERE id = ? AND username = ?"
    ).bind(id, username).run();

    return new Response(JSON.stringify({ success: true, message: "文件已删除" }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
