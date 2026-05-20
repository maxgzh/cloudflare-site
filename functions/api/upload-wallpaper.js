export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { username, file_name, file_type, file_data, folder_path = '/' } = await request.json();
    
    if (!username || !file_name || !file_data) {
      return new Response(JSON.stringify({ success: false, error: "数据不完整" }), { status: 400 });
    }

    // 🛡️ 防线一：计算全站总用量（全局熔断闸门，超 9GB 自动锁死）
    const totalCheck = await env.DB.prepare("SELECT SUM(file_size) as total FROM user_files").first();
    const totalUsedBytes = totalCheck.total || 0;
    if (totalUsedBytes >= 9 * 1024 * 1024 * 1024) {
      return new Response(JSON.stringify({ success: false, error: "❌ 本站总存储空间已达 9GB 安全熔断上限！已暂停写入。" }), { status: 403 });
    }

    // 🛡️ 防线二：限制单用户用量（每个人最多用 200MB）
    const userCheck = await env.DB.prepare("SELECT SUM(file_size) as user_total FROM user_files WHERE username = ?").bind(username).first();
    const userUsedBytes = userCheck.user_total || 0;
    if (userUsedBytes >= 200 * 1024 * 1024) {
      return new Response(JSON.stringify({ success: false, error: "❌ 您的个人云盘空间已满（上限 200MB）！" }), { status: 403 });
    }

    // 🚀 二进制文件转换并上传至 R2
    const base64Content = file_data.split(',')[1] || file_data;
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const binaryData = new Uint8Array(byteNumbers);
    const fileSize = binaryData.length;

    // 存储桶里的唯一钥匙
    const r2Key = `${Date.now()}-${username}-${file_name}`;

    // 存入 R2
    await env.BUCKET.put(r2Key, binaryData, {
      httpMetadata: { contentType: file_type }
    });

    // 记入 D1 数据库（把钥匙存进数据表）
    await env.DB.prepare(
      "INSERT INTO user_files (username, file_name, file_type, file_data, folder_path, file_size) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(username, file_name, file_type, r2Key, folder_path, fileSize).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
