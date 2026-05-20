export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { username, file_name, file_type, file_data } = await request.json();
    
    if (!username || !file_name || !file_data) {
      return new Response(JSON.stringify({ success: false, error: "文件数据不完整" }), { status: 400 });
    }

    // 重点：把当前登录的用户名和文件一起锁进数据库
    await env.DB.prepare(
      "INSERT INTO user_files (username, file_name, file_type, file_data) VALUES (?, ?, ?, ?)"
    ).bind(username, file_name, file_type, file_data).run();

    return new Response(JSON.stringify({ success: true, message: "文件已成功安全写入云数据库！" }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
