(function () {
  "use strict";

  const DEMO_USERNAME = "admin";
  const DEMO_PASSWORD = "admin123";
  const HOME_URL = "./platforms.html";
  const REMEMBERED_USERNAME_KEY = "tractorWebRememberedUsername";

  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("rememberPassword");
  const errorMessage = document.getElementById("loginError");
  const forgotButton = document.getElementById("forgotPassword");

  const rememberedUsername = window.localStorage.getItem(REMEMBERED_USERNAME_KEY);
  if (rememberedUsername) {
    usernameInput.value = rememberedUsername;
    passwordInput.value = DEMO_PASSWORD;
    rememberInput.checked = true;
    passwordInput.focus();
  } else {
    usernameInput.focus();
  }

  function showError(message) {
    errorMessage.textContent = message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      showError("用户名或密码错误，请重新输入");
      passwordInput.select();
      return;
    }

    if (rememberInput.checked) {
      window.localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
    } else {
      window.localStorage.removeItem(REMEMBERED_USERNAME_KEY);
    }

    showError("");
    window.location.href = HOME_URL;
  });

  usernameInput.addEventListener("input", function () { showError(""); });
  passwordInput.addEventListener("input", function () { showError(""); });

  forgotButton.addEventListener("click", function () {
    window.alert("当前为演示登录，请联系平台管理员重置密码。");
  });
})();
