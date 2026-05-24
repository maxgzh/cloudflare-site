export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    // 接收从前端 search.html 传来的完整对话历史（上下文连贯）
    const body = await request.json();
    const userMessages = body.messages || [];
    
    // 🌟 在 Cloudflare 后台配置的隐藏环境变量
    const API_KEY = env.DEEPSEEK_API_KEY; 
    const BASE_URL = "https://api.deepseek.com/chat/completions"; 

    if (!API_KEY) {
      throw new Error("云端未配置 DEEPSEEK_API_KEY。");
    }

    // 强力注入系统人设，确保它表现得像个专业的搜索引擎
    const systemPrompt = { 
        role: "system", 
        content: "你是由能量中转站接入的超级智能搜索助手。你的回答必须极其准确、结构清晰、直击要害。当用户询问专业知识时，像一个资深的专家一样解答；当用户闲聊时，保持礼貌和高效。请始终使用 Markdown 格式（如换行、列表）输出，方便用户阅读。" 
    };

    // 组合人设和用户真实的对话历史
    const finalMessages = [systemPrompt, ...userMessages];

    // 发起安全隐秘的网络请求
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${API_KEY}` 
        },
        body: JSON.stringify({
            model: "deepseek-chat", // 使用通用大模型
            messages: finalMessages,
            temperature: 0.7 // 0.7 比较适合搜索问答，逻辑严谨不易幻觉
        })
    });

    const data = await res.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("AI 中枢拒绝响应或返回异常。");
    }

    // 将 AI 的回复打包送回前端的对话框
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
