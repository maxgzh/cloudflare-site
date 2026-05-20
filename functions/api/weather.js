export async function onRequestGet(context) {
  const { request } = context;
  
  // 🌟 核心魔法：直接从 Cloudflare 网关抓取用户的地理位置，免 Key 且精准！
  // 如果在本地开发环境拿不到，就默认兜底为北京市
  const city = request.cf?.city || "北京市";
  
  try {
    // 由服务器端去请求开源天气服务（服务器端请求绝对不会触发浏览器的 CORS 跨域报错）
    const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    const data = await response.json();
    
    const currentCondition = data.current_condition[0];
    const tempC = currentCondition.temp_C;
    const weatherDesc = currentCondition.lang_zh ? currentCondition.lang_zh[0].value : currentCondition.weatherDesc[0].value;

    return new Response(JSON.stringify({
      success: true,
      city: city,
      temp: tempC,
      desc: weatherDesc
    }), {
      headers: { "Content-Type": "application/json;charset=utf-8" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      city: city,
      desc: "晴朗",
      temp: "26"
    }), {
      headers: { "Content-Type": "application/json;charset=utf-8" }
    });
  }
}
