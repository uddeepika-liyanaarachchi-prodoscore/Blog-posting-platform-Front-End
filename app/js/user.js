import api from "./api.js";
import { notify } from "./notify.js";
import { loadPublicPosts, loadUserPosts } from "./posts.js";

const signinView = document.getElementById("login-view");
const signUpView = document.getElementById("sign-up-view");
const mainView = document.getElementById("main-view");
const myView = document.getElementById("my-view");
const forgotView = document.getElementById("forgot-view");
const resetPasswordView = document.getElementById("reset-password-view");

const signInForm = document.getElementById("login-form");
const signUpForm = document.getElementById("sign-up-form");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const forgotForm = document.getElementById("forgot-form");
const resetPasswordForm = document.getElementById("reset-password-form");

const singUpButton = document.getElementById("sign-up-btn");
const singInButton = document.getElementById("sign-in-btn");
const loginBtnInNavbar = document.getElementById("navlogin-btn");
const HomeBtnInNavbar = document.getElementById("navhome-btn");
const navBarDashboardBTN = document.getElementById("navdashboard-btn");
const logoutButton = document.getElementById("logout-btn");
const backToLoginFromForgot = document.getElementById(
  "back-to-login-from-forgot",
);
const backToLoginFromReset = document.getElementById(
  "back-to-login-from-reset",
);

let resetEmail = "";
let loggedIn;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  loadPublicPosts();
  if (token) {
    loggedIn = true;
    updateNavbar();
    showView(myView);
    loadUserPosts();
  } else {
    loggedIn = false;
    updateNavbar();
    showView(mainView);
  }
});

// ----------------------------Show view fc  --------------------------------------------
function showView(viewToSHow) {
  mainView.classList.add("hidden");
  signinView.classList.add("hidden");
  signUpView.classList.add("hidden");
  mainView.classList.add("hidden");
  myView.classList.add("hidden");
  forgotView.classList.add("hidden");
  resetPasswordView.classList.add("hidden");
  viewToSHow.classList.remove("hidden");
}

function updateNavbar() {
  const token = localStorage.getItem("accessToken");
  if (token) {
    loggedIn = true;
    loginBtnInNavbar.classList.add("hidden");
    navBarDashboardBTN.classList.remove("hidden");
  } else {
    loginBtnInNavbar.classList.remove("hidden");
    navBarDashboardBTN.classList.add("hidden");
  }
}

// --- Navigation Click Listeners ---
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  showView(forgotView);
});

backToLoginFromForgot.addEventListener("click", (e) => {
  e.preventDefault();
  showView(signinView);
});

backToLoginFromReset.addEventListener("click", (e) => {
  e.preventDefault();
  showView(signinView);
});

navBarDashboardBTN.addEventListener("click", (e) => {
  showView(myView);
});

loginBtnInNavbar.addEventListener("click", (e) => {
  e.preventDefault();
  mainView.classList.add("hidden");
  showView(signinView);
});

HomeBtnInNavbar.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Click una");
  signinView.classList.add("hidden");
  showView(mainView);
});

singUpButton.addEventListener("click", (e) => {
  e.preventDefault();
  showView(signUpView);
});

singInButton.addEventListener("click", (e) => {
  e.preventDefault();
  showView(signinView);
});

//-------------------------Logout----------------------------

logoutButton.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  loggedIn = false;
  updateNavbar();
  showView(signinView);
});

// -----------------------LOGIN IN -------------------------------------------
signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login_email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { access_token, refresh_token, id } = response.data;

    if (access_token) localStorage.setItem("accessToken", access_token);
    if (refresh_token) localStorage.setItem("refreshToken", refresh_token);
    if (id) localStorage.setItem("userID", id);
    console.log(response.data);

    notify.success("Sign up successful! Please sign in.");

    // loggedIn = true;
    // updateNavbar();
    // signInForm.reset();
    // showView(myView);
    // loadUserPosts();
  } catch (err) {
    console.error("Login failed:", err);
    notify.error("Invalid credentials. Please try again.");
  }
});

// ----------------------- Register---------------------------------------------

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signup_mail").value.trim();
  const password = document.getElementById("register_password").value;

  try {
    const response = await api.post("/auth/register", {
      email,
      password,
    });

    notify.success("Sign up successful! Please sign in.");
    signUpForm.reset();
    showView(signinView);
  } catch (err) {
    console.error("Login failed:", err);
    notify.error("Invalid credentials. Please try again.");
  }
});

// --- ---------------------------Send OTP -------------------------------
forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resetEmail = document.getElementById("forgot_email").value.trim();

  try {
    await api.post("/auth/forgot-password", { email: resetEmail });
    notify.success("OTP sent to your email. Please check your inbox!");
    forgotForm.reset();
    showView(resetPasswordView);
  } catch (err) {
    console.error("Failed to send OTP:", err);
    notify.error("Error sending OTP. Please try again.");
  }
});

// ------------------------------Reset Password ----------------------------------------------
resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const otp = document.getElementById("reset_otp").value.trim();
  const newPassword = document.getElementById("new_password").value;

  try {
    await api.post("/auth/reset-password", {
      email: resetEmail,
      otp: otp,
      new_password: newPassword,
    });

    notify.success(
      "Password reset successfully! Please sign in with your new password.",
    );
    resetPasswordForm.reset();
    resetEmail = "";
    showView(signinView);
  } catch (err) {
    console.error("Failed to reset password:", err);
    notify.error("Invalid OTP or request failed.");
  }
});
