export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    let payload;
    try {
      payload = await request.clone().json();
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: "JSON解析失败" }), { status: 400 });
    }

    const img_date = payload.img_date;
    const img_url = payload.img_url;
    const img_name = payload.img_name;

    if (!img_date || !img_url || !img_name) {
      return new Response(JSON.stringify({ success: false, error: "核心字段丢失" }), { status: 400 });
    }

    // 🌟 核心防重防火墙：先去数据库里查一下，这个日期的壁纸是不是已经存在了？
    const existing = await env.DB.prepare(
      "SELECT id FROM wall_table WHERE img_date = ?"
    ).bind(img_date).first();

    // 如果查到了，说明已经存过，直接拦截并优雅地返回成功提示，不再执行插入！
    if (existing) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: `拦截重复：云端已存在 ${img_date} 的壁纸，跳过写入。` 
      }), { headers: { "Content-Type": "application/json;charset=utf-8" } });
    }

    // 只有没查到，才会执行真正的写入动作
    await env.DB.prepare(`
      INSERT INTO wall_table (img_date, img_url, img_name)
      VALUES (?, ?, ?)
    `).bind(img_date, img_url, img_name).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "🎉 全新壁纸云端同步成功！" 
    }), { headers: { "Content-Type": "application/json;charset=utf-8" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
