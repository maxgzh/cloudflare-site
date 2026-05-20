export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { username, folder_name, folder_path = '/' } = await request.json();
    
    // 在数据库里，文件夹其实就是一个 file_type 为 'folder' 的特殊记录
    await env.DB.prepare(
      "INSERT INTO user_files (username, file_name, file_type, file_data, folder_path) VALUES (?, ?, 'folder', '', ?)"
    ).bind(username, folder_name, folder_path).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
