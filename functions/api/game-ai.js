export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { state, action } = await request.json();
    
    // 从环境变量读取 Key
    const API_KEY = env.DEEPSEEK_API_KEY; 
    const BASE_URL = "https://api.deepseek.com/chat/completions"; 

    // 严谨：检查环境变量到底有没有生效
    if (!API_KEY) {
      throw new Error("后端的 DEEPSEEK_API_KEY 环境变量为空，请检查 Cloudflare 配置！");
    }

    const prompt = `
    你是一个硬核的经营生存游戏系统。玩家开了一家杂货铺。
    当前状态：第${state.day}天，资金 ${state.money}，库存 ${state.inventory}，名声 ${state.reputation}。
    玩家刚执行动作：“${action}”。
    请生成一个随机的突发事件，并给出结果。
    【最高指令】：接下来的剧情描述请必须、严格且只能使用“中文”进行回复！语气要冷酷、黑色幽默，字数控制在100字以内。
    剧情结束后，末尾必须附带数值变化，且数值变化区的标签必须保持英文，严格使用此格式：[MONEY:+100, INV:-5, REP:+2]（没有变化填0）。
    `;

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${API_KEY}` 
        },
        body: JSON.stringify({
            model: "deepseek-chat", // ⚠️ 注意：这里我改回了最通用的 deepseek-chat 模型，防止 flash 模型在某些节点不可用
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8
        })
    });

    const data = await res.json();

    // 🌟 核心拦截：如果 API 返回的不是正常数据，直接抛出它的真实原话！
    if (!data.choices || !data.choices[0]) {
      throw new Error("API 拒绝访问，真实返回内容：" + JSON.stringify(data));
    }

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), { headers: {"Content-Type": "application/json"} });
  } catch (error) {
    // 把真实的错误原封不动地传给前端屏幕
    return new Response(JSON.stringify({ reply: `系统连接中断。[MONEY:0, INV:0, REP:0] 错误追踪: ${error.message}` }), { status: 200 });
  }
}
