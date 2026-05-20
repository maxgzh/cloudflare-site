export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    // 新增了 folder_path 参数接收
    const { username, file_name, file_type, file_data, folder_path = '/' } = await request.json();
    
    if (!username || !file_name) {
      return new Response(JSON.stringify({ success: false, error: "数据不完整" }), { status: 400 });
    }

    // 存入数据库时，把文件夹路径一起绑进去
    await env.DB.prepare(
      "INSERT INTO user_files (username, file_name, file_type, file_data, folder_path) VALUES (?, ?, ?, ?, ?)"
    ).bind(username, file_name, file_type, file_data, folder_path).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
