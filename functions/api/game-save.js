export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { username, password, state } = await request.json();

    // 1. 验证或自动注册用户
    const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
    if (user) {
        if (user.password !== password) {
            return new Response(JSON.stringify({ success: false, error: "密码错误，无法覆盖存档" }), { status: 401 });
        }
    } else {
        // 自动注册新用户
        await env.DB.prepare("INSERT INTO users (username, password) VALUES (?, ?)").bind(username, password).run();
    }

    // 2. 写入/更新游戏存档
    await env.DB.prepare(`
        INSERT INTO game_saves (username, save_data) VALUES (?, ?)
        ON CONFLICT(username) DO UPDATE SET save_data = excluded.save_data, updated_at = CURRENT_TIMESTAMP
    `).bind(username, JSON.stringify(state)).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
