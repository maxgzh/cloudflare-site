export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  try {
    // ⚠️ 注意：这里假设你之前存壁纸的数据库表名叫做 "wallpapers"
    // 如果你的表名不一样（比如叫 bing_images 等），请把下面的 wallpapers 改成你真实的表名！
    
    if (type === 'latest') {
      // 首页获取最新的一张
      const latest = await env.DB.prepare("SELECT * FROM wallpapers ORDER BY id DESC LIMIT 1").first();
      return new Response(JSON.stringify(latest || {}));
    } else {
      // 更多壁纸页面获取全部
      const { results } = await env.DB.prepare("SELECT * FROM wallpapers ORDER BY id DESC").all();
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
