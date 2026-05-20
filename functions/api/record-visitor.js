export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    let username = "visitor";
    try {
      const textData = await request.text();
      if (textData) username = textData;
    } catch(e) {
      username = "visitor_err";
    }

    const ip = request.headers.get("cf-connecting-ip") || "未知IP";
    const city = request.cf?.city || "未知城市";
    const region = request.cf?.region || "未知省份";
    const country = request.cf?.country || "未知国家";
    
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceType = isMobile ? "手机端" : "电脑端";

    // 🌟 计算没有时差的北京标准时间
    const bjsTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    await env.DB.prepare(`
      INSERT INTO visitor_logs (username, ip, city, region, country, device_type, visit_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(username, ip, city, region, country, deviceType, bjsTime).run();

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
