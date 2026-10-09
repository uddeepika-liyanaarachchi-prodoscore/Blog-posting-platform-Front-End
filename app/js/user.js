import api from "./api.js";
const signinView = document.getElementById("login-view");
const signUpView = document.getElementById("sign-up-view");
const mainView = document.getElementById("main-view");
const myView = document.getElementById("my-view");
import { loadPublicPosts, loadUserPosts } from "./posts.js";
const signInForm = document.getElementById("login-form");
const signUpForm = document.getElementById("sign-up-form");

const singUpButton = document.getElementById("sign-up-btn");
const singInButton = document.getElementById("sign-in-btn");
const loginBtnInNavbar = document.getElementById("navlogin-btn");
const HomeBtnInNavbar = document.getElementById("navhome-btn");
const navBarDashboardBTN = document.getElementById("navdashboard-btn");
const logoutButton = document.getElementById("logout-btn");

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

navBarDashboardBTN.addEventListener("click", (e) => {
  showView(myView);
});

function showView(viewToSHow) {
  mainView.classList.add("hidden");
  signinView.classList.add("hidden");
  signUpView.classList.add("hidden");
  mainView.classList.add("hidden");
  myView.classList.add("hidden");
  viewToSHow.classList.remove("hidden");
}

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

signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();

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

    const { access_token, refresh_token,id } = response.data;

    if (access_token) localStorage.setItem("accessToken", access_token);
    if (refresh_token) localStorage.setItem("refreshToken", refresh_token);
    if (id) localStorage.setItem("userID",id)
    console.log(response.data);
    
    loggedIn = true;
    updateNavbar();
    signInForm.reset();
    showView(myView);
    loadUserPosts(); 

  } catch (err) {
    console.error("Login failed:", err);
    const message = err.response?.data?.message || "Invalid credentials. Please try again.";
    alert(message);
  }
});

// ----------------------- Register---------------------------------------------

signUpForm.addEventListener("submit",async(e)=>{
  e.preventDefault();

  const email = document.getElementById("signup_mail").value.trim();
  const password = document.getElementById("register_password").value;

  try {
    const response = await api.post("/auth/register", {
      email,
      password,
    })

     alert("Sign up successful! Please sign in.");
     signUpForm.reset();
     showView(signinView);
  } catch (err) {
    console.error("Login failed:", err);
    const message =
      err.response?.data?.message || "Invalid credentials. Please try again.";
    alert(message);
  }

})