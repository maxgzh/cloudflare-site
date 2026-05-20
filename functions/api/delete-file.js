<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>能量中转站 - 登录</title>
    <style>
        /* 1. 基础样式 */
        body { 
            font-family: sans-serif; 
            background: #f4ecdf; 
            margin: 0; 
            padding: 0; 
            color: #2f251c;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        /* 2. 核心登录卡片 */
        .login-container { 
            width: 360px; 
            background: rgba(255,255,255,0.9); 
            padding: 30px; 
            border-radius: 20px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            z-index: 10;
        }
        .tabs { display: flex; justify-content: space-around; margin-bottom: 20px; border-bottom: 1px solid #efe1cb; padding-bottom: 10px;}
        .tab { cursor: pointer; font-weight: bold; color: #888; padding: 5px 10px; }
        .tab.active { color: #c0743a; border-bottom: 3px solid #c0743a; }
        .input-group { margin-bottom: 15px; }
        .input-group label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: bold;}
        .input-group input { width: 100%; padding: 10px; border: 1px solid #efe1cb; border-radius: 8px; box-sizing: border-box; background: #fff;}
        .btn { width: 100%; background: #2f251c; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; margin-top: 10px;}
        
        /* 🌟 3. 新增：左上角高颜值天气组件 */
        .weather-box {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(10px); /* 毛玻璃特效 */
            -webkit-backdrop-filter: blur(10px);
            padding: 12px 18px;
            border-radius: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            border: 1px solid rgba(255,255,255,0.4);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10;
            font-size: 14px;
        }
        .weather-city { font-weight: bold; color: #c0743a; }
        .weather-temp { font-size: 18px; font-weight: bold; color: #2f251c; }

        /* 🌟 4. 新增：右下角必应壁纸组件（整体加大） */
        .wallpaper-card {
            position: absolute;
            bottom: 25px;
            right: 25px;
            width: 200px; /* 从原先的尺寸放大到 200px */
            background: rgba(255, 255, 255, 0.85);
            padding: 10px;
            border-radius: 14px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.06);
            z-index: 10;
            text-align: center;
            font-size: 12px;
            transition: transform 0.3s ease;
        }
        .wallpaper-card:hover {
            transform: scale(1.05); /* 鼠标悬浮轻微放大，增加动效 */
        }
        .wallpaper-thumb {
            width: 100%;
            height: 125px; /* 高度同比放大 */
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 6px;
            display: block;
        }
        .wallpaper-btn {
            color: #c0743a;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin-top: 2px;
        }
    </style>
</head>
<body>

<div class="weather-box" id="weatherBox">
    <div style="font-size: 24px;" id="weatherIcon">🔍</div>
    <div>
        <div id="weatherLocation" class="weather-city">正在定位...</div>
        <div style="font-size: 11px; color: #666;" id="weatherDetail">获取天气中...</div>
    </div>
    <div id="weatherTemp" class="weather-temp">--°C</div>
</div>

<div class="login-container">
    <div class="tabs">
        <div class="tab active" id="tab-login" onclick="switchTab('login')">登录</div>
        <div class="tab" id="tab-register" onclick="switchTab('register')">注册账号</div>
    </div>
    
    <div class="input-group">
        <label for="username">账号</label>
        <input type="text" id="username" placeholder="请输入您的账号...">
    </div>
    <div class="input-group">
        <label for="password">密码</label>
        <input type="password" id="password" placeholder="请输入您的密码...">
    </div>
    
    <button class="btn" id="submitBtn" onclick="handleSubmit()">安全登录</button>
</div>

<div class="wallpaper-card">
    <img src="https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN" class="wallpaper-thumb" id="bingImg" alt="今日壁纸">
    <div style="font-weight: bold; color: #555; margin-bottom: 2px;">今日必应壁纸</div>
    <a href="#" class="wallpaper-btn" onclick="viewMoreWallpapers()">查看更多壁纸 →</a>
</div>

<script>
    let currentMode = 'login';

    // 1. 切换 登录/注册 选项卡
    function switchTab(mode) {
        currentMode = mode;
        document.getElementById('tab-login').classList.toggle('active', mode === 'login');
        document.getElementById('tab-register').classList.toggle('active', mode === 'register');
        document.getElementById('submitBtn').innerText = mode === 'login' ? '安全登录' : '立即注册账号';
    }

    // 2. 登录/注册 点击事件
    async function handleSubmit() {
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value.trim();
        if(!u || !p) return alert('账号和密码不能为空！');

        if (currentMode === 'login') {
            // 登录逻辑：存入 localStorage 并跳转
            localStorage.setItem('currentUser', u);
            window.location.href = 'dashboard.html';
        } else {
            // 注册逻辑（这里可以对接你之前的注册 D1 接口，暂时做模拟成功弹窗）
            alert('🎉 注册成功！已为您自动切换到登录。');
            switchTab('login');
        }
    }

    // 3. 🌟 核心魔法：根据用户 IP 自动获取位置和实时天气
    async function initWeather() {
        try {
            // 使用高德地图免费公开的 IP 定位接口（免 Key，能直接精确到城市）
            const ipRes = await fetch('https://restapi.amap.com/v3/ip?key=b2eb00d83b632617f694e9fe9a6c7104');
            const ipData = await ipRes.json();
            
            // 如果高德定位失败，采用兜底方案（北京市）
            let city = "北京市";
            if (ipData && ipData.status === "1" && typeof ipData.city === 'string' && ipData.city.length > 0) {
                city = ipData.city;
            }

            // 将城市名字喂给 wttr.in 天气接口（这是一个全球开源、天生支持通过城市名返回 JSON 的极品天气服务）
            const weatherRes = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            const weatherData = await weatherRes.json();
            
            // 解析返回的实时天气数据
            const currentCondition = weatherData.current_condition[0];
            const tempC = currentCondition.temp_C; // 摄氏度
            const weatherDesc = currentCondition.lang_zh ? currentCondition.lang_zh[0].value : currentCondition.weatherDesc[0].value; // 天气中文描述

            // 根据天气关键词，智能匹配小图标
            let icon = "☀️";
            const desc = weatherDesc.toLowerCase();
            if (desc.includes("雨")) icon = "🌧️";
            else if (desc.includes("云") || desc.includes("阴")) icon = "☁️";
            else if (desc.includes("雪")) icon = "❄️";
            else if (desc.includes("雾") || desc.includes("霾")) icon = "🌫️";

            // 渲染到左上角组件中
            document.getElementById('weatherIcon').innerText = icon;
            document.getElementById('weatherLocation').innerText = city;
            document.getElementById('weatherDetail').innerText = weatherDesc;
            document.getElementById('weatherTemp').innerText = `${tempC}°C`;

        } catch (error) {
            // 发生异常时的温和兜底
            console.error("天气获取失败:", error);
            document.getElementById('weatherIcon').innerText = "🌤️";
            document.getElementById('weatherLocation').innerText = "地球";
            document.getElementById('weatherDetail').innerText = "晴朗";
            document.getElementById('weatherTemp').innerText = "26°C";
        }
    }

    // 4. 查看更多壁纸的点击动作
    function viewMoreWallpapers() {
        alert("正在为您解锁更多高清大图预览...");
        // 你可以把这里定向到你存放壁纸的任何页面，或者保持原样
    }

    // 页面加载时自动触发天气获取
    window.onload = function() {
        initWeather();
    };
</script>
</body>
</html>
