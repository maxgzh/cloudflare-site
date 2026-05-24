export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { state, action } = await request.json();
    
    // 🌟 1. 绝对安全：从 Cloudflare 后台读取加密的环境变量，代码里不再出现真实 Key
    const API_KEY = env.DEEPSEEK_API_KEY; 
    
    // 🌟 2. 对接你的 OpenClaw：
    // 如果你要用官方接口，就填 "https://api.deepseek.com/chat/completions"
    // 如果你服务器的 OpenClaw 提供了对外的 OpenAI 兼容地址，就换成你自己的！
    // 比如： "http://你服务器的IP或域名:端口/v1/chat/completions"
    const BASE_URL = "https://api.deepseek.com/chat/completions"; 

    const prompt = `
    你是一个硬核的经营生存游戏系统。玩家开了一家杂货铺。
    当前玩家状态：第${state.day}天，资金 ${state.money}，库存 ${state.inventory}，名声 ${state.reputation}。
    玩家刚执行了动作：“${action}”。
    请你生成一个随机的突发事件，并给出这个动作的结果。
    请直接以第一人称口吻回复，语气冷酷、黑色幽默，字数控制在100字以内。
    最后必须在末尾附带数值变化，严格使用格式：[MONEY:+100, INV:-5, REP:+2]（没有变化的属性填0）。
    `;

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            // 如果你的 OpenClaw 需要不同的鉴权头，可以在这里修改
            "Authorization": `Bearer ${API_KEY}` 
        },
        body: JSON.stringify({
            model: "deepseek-v4-flash", // 如果 OpenClaw 里映射了别的模型名，这里对应修改
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8
        })
    });

    const data = await res.json();
    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), { headers: {"Content-Type": "application/json"} });
  } catch (error) {
    return new Response(JSON.stringify({ reply: `系统连接中断。[MONEY:0, INV:0, REP:0] 错误信息: ${error.message}` }), { status: 200 });
  }
}
