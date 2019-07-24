let formElem = document.querySelector("[action='/signup']");

if (formElem) {
  formElem.addEventListener("submit", function (event) {
    let passwordInputElem = event.currentTarget.querySelector("[type='password']");
    let password = passwordInputElem.value;

    let isValidPassword = password.length > 7;

    if (!isValidPassword) {
      event.preventDefault();
      event.currentTarget.classList.add("has-invalid-password");
    }
  });
}