export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const { username } = await request.json().catch(() => ({ username: 'visitor' }));

    // 1. 获取访客网络与设备信息
    const ip = request.headers.get("cf-connecting-ip") || "未知IP";
    const city = request.cf?.city || "未知城市";
    const region = request.cf?.region || "未知省份";
    const country = request.cf?.country || "未知国家";
    
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceType = isMobile ? "手机端" : "电脑端";

    // 2. 🌟 核心：计算精准的北京时间（东八区），格式为：YYYY-MM-DD HH:mm:ss
    const bjsTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    // 3. 写入 D1 数据库（带上 visit_time）
    await env.DB.prepare(`
      INSERT INTO visitor_logs (username, ip, city, region, country, device_type, visit_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(username, ip, city, region, country, deviceType, bjsTime).run();

    return new Response(JSON.stringify({ success: true, message: "访客轨迹已记录" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
