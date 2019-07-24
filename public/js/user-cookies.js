import docCookie from "./cookie-lib";

// fake user login
document.body.addEventListener("click", function (event) {
  if (event.target.matches("a") && event.target.closest(".login-row")) {
    event.preventDefault();
    docCookie.setItem("user", event.target.innerText.toLowerCase());
    document.location.reload();
  }
});

if (!docCookie.getItem("user")) {
  docCookie.setItem("user", "john");
}

window.docCookie = docCookie;