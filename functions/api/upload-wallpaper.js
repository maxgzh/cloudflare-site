export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    // 解析 Python 脚本发来的 JSON 包裹
    const payload = await request.json();

    // 🌟 核心对齐：严格匹配你 Python 脚本里的 payload 字段名
    const img_date = payload.img_date;
    const img_url = payload.img_url;
    const img_name = payload.img_name;

    // 检查是否有缺失
    if (!img_date || !img_url || !img_name) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "数据不完整" 
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json;charset=utf-8" }
      });
    }

    // 🌟 写入 D1 数据库 (使用 wall_table)
    await env.DB.prepare(`
      INSERT INTO wall_table (img_date, img_url, img_name)
      VALUES (?, ?, ?)
    `).bind(img_date, img_url, img_name).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "🎉 壁纸云端同步成功！" 
    }), {
      headers: { "Content-Type": "application/json;charset=utf-8" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json;charset=utf-8" }
    });
  }
}
