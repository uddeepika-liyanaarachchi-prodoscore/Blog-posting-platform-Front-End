const signinView = document.getElementById("login-view");
const signUpView = document.getElementById("sign-up-view");
const mainView = document.getElementById("main-view")
const myView = document.getElementById("my-view")

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
  showView(mainView);
});

function updateNavbar() {
  if (loggedIn==true) {
    loginBtnInNavbar.classList.add("hidden"); 
    navBarDashboardBTN.classList.remove("hidden"); 
  } else {
    loginBtnInNavbar.classList.remove("hidden");
    navBarDashboardBTN.classList.add("hidden");
  }
}

navBarDashboardBTN.addEventListener("click",(e)=>{
  showView(myView)
})

function showView(viewToSHow){
    mainView.classList.add("hidden")
    signinView.classList.add("hidden");
    signUpView.classList.add("hidden")
    mainView.classList.add("hidden")
    myView.classList.add("hidden")
    viewToSHow.classList.remove("hidden")
}

loginBtnInNavbar.addEventListener("click",(e)=>{
    e.preventDefault()
    mainView.classList.add("hidden")
    showView(signinView)

})

HomeBtnInNavbar.addEventListener("click",(e)=>{
  e.preventDefault()
  console.log("Click una")
  signinView.classList.add("hidden")
  showView(mainView)
})

singUpButton.addEventListener("click",(e)=>{
    e.preventDefault()
    showView(signUpView)
})

singInButton.addEventListener("click",(e)=>{
    e.preventDefault()
    showView(signinView);
})

signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Sign up successful! Please sign in.");
  signUpForm.reset();
  showView(signinView);
});

signInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  signInForm.reset();
  loggedIn = true;
  updateNavbar();
  showView(myView)
});

logoutButton.addEventListener("click",(e)=>{
  e.preventDefault();
  
  loggedIn =false;
  updateNavbar()
  showView(signinView)
})