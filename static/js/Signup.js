function showError(message) {
  const banner = document.getElementById("signup-error");
  banner.textContent = message;
  banner.style.display = "block";
  banner.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearError() {
  const banner = document.getElementById("signup-error");
  banner.textContent = "";
  banner.style.display = "none";
}

function validateUsername(input) {
  const pattern = /^[A-Za-z0-9_]{3,20}$/;
  if (!pattern.test(input.value.trim())) {
    input.setCustomValidity("Username must be letters, numbers and underscores only.");
    input.reportValidity();
    return false;
  }
  input.setCustomValidity("");
  return true;
}

document.getElementById("user-name").addEventListener("input", function () {
  validateUsername(this);
});

document.getElementById("Pass").addEventListener("input", clearError());

document.getElementById("confirm").addEventListener("input", clearError());

document.querySelector("form").addEventListener("submit", function (e) {
  clearError();

  const userName        = document.getElementById("user-name");
  const password        = document.getElementById("Pass");
  const confirmPassword = document.getElementById("confirm");
  const gender          = document.querySelector('input[name="gender"]:checked');
  const role            = document.querySelector('input[name="role"]:checked');

  if (!validateUsername(userName)) {
    e.preventDefault();
    return;
  }

  if (password.value.length < 6) {
    e.preventDefault();
    showError("Password must be at least 6 characters.");
    return;
  }

  if (password.value !== confirmPassword.value) {
    e.preventDefault();
    showError("Passwords do not match.");
    return;
  }

  if (!gender) {
    e.preventDefault();
    showError("Please select a gender!");
    return;
  }

  if (!role) {
    e.preventDefault();
    showError("Please select a role!");
    return;
  }
});