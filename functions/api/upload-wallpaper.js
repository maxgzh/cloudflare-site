export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    // 1. 尝试解析前端发来的 JSON
    let payload;
    try {
      payload = await request.clone().json();
    } catch (e) {
      // 如果根本不是 JSON 格式，直接把收到的纯文本退回去
      const rawText = await request.text();
      return new Response(JSON.stringify({ 
        success: false, 
        error: "JSON解析彻底失败，请检查请求格式", 
        received_raw: rawText 
      }), { status: 400, headers: { "Content-Type": "application/json;charset=utf-8" } });
    }

    // 2. 提取字段
    const img_date = payload.img_date;
    const img_url = payload.img_url;
    const img_name = payload.img_name;

    // 3. 🌟 核心：如果找不到字段，把 payload 直接打回宝塔面板！
    if (!img_date || !img_url || !img_name) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "核心字段丢失！请看下一行的 received_data",
        received_data: payload // 重点：让宝塔日志打印出到底收到了什么鬼东西
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json;charset=utf-8" }
      });
    }

    // 4. 正常写入 D1
    await env.DB.prepare(`
      INSERT INTO wall_table (img_date, img_url, img_name)
      VALUES (?, ?, ?)
    `).bind(img_date, img_url, img_name).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "🎉 壁纸云端同步成功！" 
    }), { headers: { "Content-Type": "application/json;charset=utf-8" } });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "服务器内部SQL写入报错：" + error.message 
    }), { status: 500, headers: { "Content-Type": "application/json;charset=utf-8" } });
  }
}
