const settings = document.querySelectorAll(
  "body > div > div > div > label > input[type=checkbox]"
);

// Saves options to browser.storage
const saveOptions = function () {
  const savedData = {};
  settings.forEach((input) => {
    savedData[input.id] = input.checked;
  });

  browser.storage.sync.set(savedData);

  const status = document.getElementById("status");
  status.textContent = "Options saved.";
  status.classList.add("message-body");

  const timeout = 750;
  setTimeout(() => {
    status.textContent = "";
    status.className = "";
  }, timeout);
};

// Restores select box and checkbox state using the preferences
// stored in browser.storage.
const restoreOptions = async function () {
  const savedData = await loadSavedData();

  settings.forEach((input) => {
    input.checked = savedData[input.id];
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveBut").addEventListener("click", saveOptions);
