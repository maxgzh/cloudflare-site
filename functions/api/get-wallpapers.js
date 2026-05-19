export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type"); // 获取参数，看是只要一张还是全部

  try {
    if (type === "latest") {
      # 1. 登录页用：只要最新的一张
      const latest = await env.DB.prepare(
        "SELECT * FROM wall_table ORDER BY img_date DESC LIMIT 1"
      ).first();
      return new Response(JSON.stringify(latest), { headers: { "Content-Type": "application/json" } });
    } else {
      # 2. 画廊页用：拿出所有的历史记录
      const { results } = await env.DB.prepare(
        "SELECT * FROM wall_table ORDER BY img_date DESC"
      ).all();
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
