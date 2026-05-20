export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get("username"); 
  const folder_path = url.searchParams.get("folder_path") || '/';

  // 🌟 刚哥已经帮你把上面复制的真实 R2 网址精准填入进去了！
  const R2_PUBLIC_URL = "https://pub-f068a15eec71489c8b70b0e36a5addfd.r2.dev"; 

  if (!username) return new Response(JSON.stringify({ error: "未登录" }), { status: 400 });

  try {
    const { results } = await env.DB.prepare(
      "SELECT id, file_name, file_type, file_data, created_at, folder_path, file_size FROM user_files WHERE username = ? AND folder_path = ? ORDER BY file_type DESC, created_at DESC"
    ).bind(username, folder_path).all();
    
    // 自动拼接上 R2 的真实下载链接
    const mergedResults = results.map(file => {
      if (file.file_type !== 'folder') {
        file.download_url = `${R2_PUBLIC_URL}/${file.file_data}`;
      }
      return file;
    });

    return new Response(JSON.stringify(mergedResults), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
