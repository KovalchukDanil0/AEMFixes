// Saves options to browser.storage
const saveOptions = async function () {
  const disableCreateWF = document.getElementById("disCreateWF").checked;
  const enableFunErr = document.getElementById("enableFunErr").checked;

  await browser.storage.sync.set({
    disableCreateWF,
    enableFunErr,
  });
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
  const items = await loadSavedData();
  document.getElementById("disCreateWF").checked = items.disableCreateWF;
  document.getElementById("enableFunErr").checked = items.enableFunErr;
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveBut").addEventListener("click", saveOptions);
