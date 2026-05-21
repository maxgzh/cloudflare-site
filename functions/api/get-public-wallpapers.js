export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  try {
    // 1. 如果前端首页请求最新的一张壁纸
    if (type === 'latest') {
      const latest = await env.DB.prepare("SELECT * FROM wall_table ORDER BY id DESC LIMIT 1").first();
      return new Response(JSON.stringify(latest || {}), { 
        headers: { "Content-Type": "application/json;charset=utf-8" } 
      });
    } 
    
    // 2. 如果是壁纸库页面请求全部壁纸列表
    // 🌟 核心修复：直接使用 .all() 拿到结果，并通过 results 返回标准数组
    const { results } = await env.DB.prepare("SELECT * FROM wall_table ORDER BY id DESC").all();
    
    // 如果没有查到结果，返回空数组，不让前端报错
    const dataList = results || [];

    return new Response(JSON.stringify(dataList), { 
      headers: { 
        "Content-Type": "application/json;charset=utf-8",
        "Cache-Control": "no-cache" // 防止 Cloudflare 缓存了以前空的数据
      } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, results: [] }), { 
      status: 500, 
      headers: { "Content-Type": "application/json;charset=utf-8" } 
    });
  }
}
