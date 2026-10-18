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

// -----------------ADMIN-------------------------
const adminView = document.getElementById("admin-view");
const usersTableBody = document.getElementById("users-table-body");
const adminRegisterModal = document.getElementById("admin-register-modal");
const openRegisterAdminBtn = document.getElementById("open-register-admin-btn");
const adminModalCloseBtn = document.getElementById("admin-modal-close-btn");
const adminModalBackdrop = document.getElementById("admin-modal-backdrop");
const registerAdminForm = document.getElementById("register-admin-form");
const adminLogoutBtn = document.getElementById("admin-logout-btn");

let resetEmail = "";
let loggedIn;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");
  loadPublicPosts();
  initGoogleSignIn();
  if (token) {
    loggedIn = true;
    updateNavbar();
    if (role === "admin") {
      showView(adminView);
      loadAllUsers();
    } else {
      showView(myView);
      loadUserPosts();
    }
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
  if (adminView) adminView.classList.add("hidden");
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
  e.preventDefault();
  const role = localStorage.getItem("userRole");
  if (role === "admin") {
    showView(adminView);
    loadAllUsers();
  } else {
    showView(myView);
  }
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

// --- Admin Register Modal Logic ---
openRegisterAdminBtn?.addEventListener("click", () => {
  registerAdminForm.reset();
  adminRegisterModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
});

function closeAdminModal() {
  adminRegisterModal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

adminModalCloseBtn?.addEventListener("click", closeAdminModal);
adminModalBackdrop?.addEventListener("click", closeAdminModal);

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

    const { access_token, refresh_token, id, role } = response.data;

    if (access_token) localStorage.setItem("accessToken", access_token);
    if (refresh_token) localStorage.setItem("refreshToken", refresh_token);
    if (id) localStorage.setItem("userID", id);
    if (role) localStorage.setItem("userRole", role);
    console.log(response.data);

    notify.success("Sign up successful! Please sign in.");

    loggedIn = true;
    updateNavbar();
    signInForm.reset();
    if (role === "admin") {
      showView(adminView);
      loadAllUsers();
    } else {
      showView(myView);
      loadUserPosts();
    }
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

// ----------------------Initialize Google login - (take google client id from DB-----------------------------------)
async function initGoogleSignIn() {
  if (typeof google === "undefined" || !google.accounts) {
    setTimeout(initGoogleSignIn, 300);
    return;
  }

  try {
    const res = await api.get("/auth/config/google-client-id");
    const clientId = res.data.client_id;
    console.log(res.data);
    console.log(clientId);

    if (!clientId) console.log("NO ID FOUND");
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleLoginResponse,
    });

    const container = document.getElementById("google-btn-container");
    if (container) {
      google.accounts.id.renderButton(container, {
        theme: "filled_black",
        size: "large",
        shape: "rectangular",
        width: 280,
      });
    }
  } catch (err) {
    console.error("Failed to load Google Client ID:", err);
  }
}

// ---------------------------------Handle Google LogIN-------------------------------------------------------

async function handleGoogleLoginResponse(response) {
  const idToken = response.credential;

  try {
    const res = await api.post("/auth/google", {
      token: idToken,
    });

    const { access_token, refresh_token, id, role } = res.data;

    if (access_token) localStorage.setItem("accessToken", access_token);
    if (refresh_token) localStorage.setItem("refreshToken", refresh_token);
    if (id) localStorage.setItem("userID", id);
    if (role) localStorage.setItem("userRole", role);

    notify.success("Google Sign-In successful!");

    loggedIn = true;
    updateNavbar();
    if (role === "admin") {
      showView(adminView);
      loadAllUsers();
    } else {
      showView(myView);
      loadUserPosts();
    }
  } catch (err) {
    console.error("Google auth error:", err);
    notify.error(
      err.response?.data?.message || "Google login failed. Please try again.",
    );
  }
}

// --------------------------------Load all users--------------------------------------------------------------------

async function loadAllUsers() {
  if (!usersTableBody) return;
  usersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #9ca3af;">Loading users...</td></tr>`;

  try {
    const response = await api.get("/auth/get-all-users");
    const users = response.data || [];

    if (users.length === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No users found.</td></tr>`;
      return;
    }

    usersTableBody.innerHTML = users
      .map((u) => {
        const fullName =
          [u.first_name, u.last_name].filter(Boolean).join(" ") || "-";
        const phone = u.phone_number || "-";
        const roleClass = u.role === "admin" ? "admin" : "user";

        return `
          <tr>
            <td>#${u.id}</td>
            <td>${u.email}</td>
            <td>${fullName}</td>
            <td>${phone}</td>
            <td><span class="role-badge ${roleClass}">${u.role}</span></td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Failed to load users:", err);
    usersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444;">Failed to load users.</td></tr>`;
  }
}

// -------------------------Register Admin -------------------------------------------- ---
registerAdminForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin_reg_email").value.trim();
  const password = document.getElementById("admin_reg_password").value;
  const submitBtn = document.getElementById("submit-admin-btn");
  const token = localStorage.getItem("accessToken");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating...";

  try {
    await api.post(
      "/auth/register-admin",
      { email, password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    notify.success("Admin registered successfully!");
    closeAdminModal();
    loadAllUsers();
  } catch (err) {
    console.error("Admin registration failed:", err);
    notify.error(err.response?.data?.detail || "Failed to create admin");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register Admin";
  }
});

// ---------------------------- Admin Logout ------------------------- ---
adminLogoutBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  loggedIn = false;
  updateNavbar();
  showView(signinView);
});
