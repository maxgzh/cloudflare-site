export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { id, username } = await request.json();
    
    if (!id || !username) {
      return new Response(JSON.stringify({ success: false, error: "参数不完整" }), { status: 400 });
    }

    // 1. 先查出这个文件的 R2 钥匙和类型
    const fileInfo = await env.DB.prepare(
      "SELECT file_data, file_type FROM user_files WHERE id = ? AND username = ?"
    ).bind(id, username).first();
    
    if (fileInfo) {
      // 2. 如果是普通文件，尝试去 R2 存储桶里删除实体
      if (fileInfo.file_type !== 'folder' && fileInfo.file_data) {
        try {
          await env.BUCKET.delete(fileInfo.file_data);
        } catch (r2Error) {
          console.log("R2实体文件删除跳过或未找到:", r2Error.message);
        }
      }
    }

    // 3. 铁腕强拆：不管 R2 那边顺不顺利，死活都要把 D1 数据库里的账本记录删掉！
    await env.DB.prepare(
      "DELETE FROM user_files WHERE id = ? AND username = ?"
    ).bind(id, username).run();

    return new Response(JSON.stringify({ success: true, message: "文件已彻底清理！" }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
