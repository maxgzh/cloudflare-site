export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { id, username } = await request.json();
    
    // 先查出这个文件的 R2 钥匙
    const fileInfo = await env.DB.prepare("SELECT file_data, file_type FROM user_files WHERE id = ? AND username = ?").bind(id, username).first();
    
    if (fileInfo) {
      // 1. 如果是文件，先从 R2 存储桶里彻底删掉实体
      if (fileInfo.file_type !== 'folder') {
        await env.BUCKET.delete(fileInfo.file_data);
      }
      // 2. 从 D1 数据库注销账目
      await env.DB.prepare("DELETE FROM user_files WHERE id = ? AND username = ?").bind(id, username).run();
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
