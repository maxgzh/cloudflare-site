(function () {
  "use strict";

  const API_BASE_URL =
    window.TRACTOR_WEB_CONFIG?.API_BASE_URL || "https://api.maxgzh.xyz";
  const pendingRequests = new Map();

  window.apiFetch = async function apiFetch(path, options = {}) {
    const requestKey = options.requestKey || path.split("?")[0];
    const previous = pendingRequests.get(requestKey);
    if (previous) previous.abort();

    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        method: "GET",
        headers: { Accept: "application/json", ...(options.headers || {}) },
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`接口返回异常（HTTP ${response.status}）`);
      }
      try {
        return await response.json();
      } catch (error) {
        throw new Error("接口返回的数据格式不正确");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("数据请求超时或已被新的请求替换");
      }
      console.error("API 请求失败", { path, error });
      throw new Error(error.message || "无法连接数据服务，请稍后重试");
    } finally {
      window.clearTimeout(timeoutId);
      if (pendingRequests.get(requestKey) === controller) {
        pendingRequests.delete(requestKey);
      }
    }
  };
})();
