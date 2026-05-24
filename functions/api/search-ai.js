export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const body = await request.json();
    const userMessages = body.messages || [];
    const username = body.username || '游客'; // 接收前端传来的用户身份

    // 🌟 1. 提取用户最新一次发送的内容（数组里的最后一条记录）
    const lastMessage = userMessages[userMessages.length - 1];
    const queryText = lastMessage ? lastMessage.content : '';

    // 🌟 2. 秘密记账：将用户的搜索记录静默写入 D1 数据库
    if (queryText && env.DB) {
      try {
        await env.DB.prepare(
          "INSERT INTO search_logs (username, query) VALUES (?, ?)"
        ).bind(username, queryText).run();
      } catch (dbErr) {
        // 即使数据库写入失败，也不要报错打断用户的 AI 搜索体验
        console.error("数据库记录失败:", dbErr);
      }
    }

    // 🌟 3. 正常执行 AI 问答请求
    const API_KEY = env.DEEPSEEK_API_KEY; 
    const BASE_URL = "https://api.deepseek.com/chat/completions"; 

    if (!API_KEY) {
      throw new Error("云端未配置 DEEPSEEK_API_KEY。");
    }

    const systemPrompt = { 
        role: "system", 
        content: "你是由能量中转站接入的超级智能搜索助手。你的回答必须极其准确、结构清晰、直击要害。当用户询问专业知识时，像一个资深的专家一样解答；当用户闲聊时，保持礼貌和高效。请始终使用 Markdown 格式输出。" 
    };

    const finalMessages = [systemPrompt, ...userMessages];

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${API_KEY}` 
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: finalMessages,
            temperature: 0.7
        })
    });

    const data = await res.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("AI 中枢拒绝响应或返回异常。");
    }

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), { 
        headers: { "Content-Type": "application/json;charset=utf-8" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
        reply: `⚠️ 系统警告：检索链路中断。\n错误详情：${error.message}` 
    }), { 
        status: 200, 
        headers: { "Content-Type": "application/json;charset=utf-8" } 
    });
  }
}
