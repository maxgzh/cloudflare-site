export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  try {
    // 🌟 核心修复：已经将旧表名更改为你数据库里的真实名称 wall_table
    if (type === 'latest') {
      const latest = await env.DB.prepare("SELECT * FROM wall_table ORDER BY id DESC LIMIT 1").first();
      return new Response(JSON.stringify(latest || {}), { headers: { "Content-Type": "application/json;charset=utf-8" } });
    } else {
      const { results } = await env.DB.prepare("SELECT * FROM wall_table ORDER BY id DESC").all();
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json;charset=utf-8" } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
