export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    // 1. 伸出手，接过阿里云发过来的壁纸数据
    const data = await request.json();
    const { img_date, img_url, img_name } = data;
    
    // 2. 转身把数据塞进你那张 wall_table 壁纸表里
    // （这里的 env.DB 就是你的数据库代号）
    await env.DB.prepare(
      "INSERT INTO wall_table (img_date, img_url, img_name) VALUES (?, ?, ?)"
    ).bind(img_date, img_url, img_name).run();
    
    return new Response(JSON.stringify({ success: true, message: "签收成功，已存入数据库！" }));
    
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }));
  }
}
