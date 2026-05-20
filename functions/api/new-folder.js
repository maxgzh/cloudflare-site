export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { username, folder_name, folder_path = '/' } = await request.json();
    await env.DB.prepare(
      "INSERT INTO user_files (username, file_name, file_type, file_data, folder_path, file_size) VALUES (?, ?, 'folder', '', ?, 0)"
    ).bind(username, folder_name, folder_path).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
