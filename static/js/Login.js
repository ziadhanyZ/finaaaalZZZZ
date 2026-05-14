const errorBanner = document.getElementById("login-error");

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.style.display = "block";
  errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearError() {
  errorBanner.textContent = "";
  errorBanner.style.display = "none";
}

document.getElementById("Pass").addEventListener("input", function() {
    clearError();
}) 

document.getElementById("username").addEventListener("input", function() {
    clearError();
}) 

document.querySelector("form").addEventListener("submit", function (e) {
  clearError();
 
  const userName = document.getElementById("username");
  const password = document.getElementById("Pass");
 
  const userValue = userName.value.trim();
  const passValue= password.value;

  if (!userValue) {
    e.preventDefault();
    showError("Please enter your username!");
    return;
  }

  if (!passValue) {
    e.preventDefault();
    showError("Please enter your password!");
    return;
  }
});