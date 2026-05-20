export async function onRequestGet(context) {
  const { request } = context;

  try {
    // 🌟 终极杀手锏：直接利用 Cloudflare 底层网关自动获取用户的经纬度和城市
    // 不需要任何外部 IP 接口，浏览器也绝对无法拦截！
    const lat = request.cf?.latitude || 25.0330; // 如果是在本地测试拿不到，就默认台北市经纬度
    const lon = request.cf?.longitude || 121.5654;
    const city = request.cf?.city || "台北市";

    // 后端直连国际气象开源接口
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.current_weather.temperature);
    const code = weatherData.current_weather.weathercode;

    let icon = "☀️";
    let desc = "晴朗";

    // 国际气象状态码解析
    if (code === 0) { icon = "☀️"; desc = "晴朗"; }
    else if (code >= 1 && code <= 3) { icon = "☁️"; desc = "多云"; }
    else if (code >= 45 && code <= 48) { icon = "🌫️"; desc = "雾霾"; }
    else if (code >= 51 && code <= 67) { icon = "🌧️"; desc = "降雨"; }
    else if (code >= 71 && code <= 77) { icon = "❄️"; desc = "降雪"; }
    else if (code >= 95) { icon = "⛈️"; desc = "雷阵雨"; }

    // 把整理好的数据发给前端
    return new Response(JSON.stringify({ success: true, city, temp, desc, icon }), {
      headers: { "Content-Type": "application/json;charset=utf-8" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
