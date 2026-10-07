const signinView = document.getElementById("login-view");
const signUpView = document.getElementById("sign-up-view");
const mainView = document.getElementById("main-view")

const signInForm = document.getElementById("login-form");
const signUpForm = document.getElementById("sign-up-form");

const singUpButton = document.getElementById("sign-up-btn");
const singInButton = document.getElementById("sign-in-btn");

function showView(viewToSHow){
    signinView.classList.add("hidden");
    signUpView.classList.add("hidden")

    viewToSHow.classList.remove("hidden")
}

singUpButton.addEventListener("click",(e)=>{
    e.preventDefault()
    console.log("Clicked una sign up eka")
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
  showView(mainView);
});
