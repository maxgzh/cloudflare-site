export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { id, username, new_folder_path } = await request.json();
    
    // 移动文件 = 仅仅把它的 folder_path 字段改掉
    await env.DB.prepare(
      "UPDATE user_files SET folder_path = ? WHERE id = ? AND username = ?"
    ).bind(new_folder_path, id, username).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
