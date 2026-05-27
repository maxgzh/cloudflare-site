export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
        return new Response("Missing file key", { status: 400 });
    }

    try {
        // 拿着钥匙，从 R2 存储桶中提取真正的文件实体
        const object = await env.BUCKET.get(key);
        
        if (object === null) {
            return new Response("File not found in R2", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);

        // 直接把文件数据流返回给前端浏览器
        return new Response(object.body, { headers });
    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
}
