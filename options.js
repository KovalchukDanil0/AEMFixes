// Saves options to browser.storage
const saveOptions = async () => {
  const disableCreateWF = document.getElementById("disCreateWF").checked;
  const enableFunErr = document.getElementById("enableFunErr").checked;

  await browser.storage.sync.set({
    disableCreateWF: disableCreateWF,
    enableFunErr: enableFunErr,
  });
  const status = document.getElementById("status");
  status.textContent = "Options saved.";
  status.classList.add("message-body");
  setTimeout(() => {
    status.textContent = "";
    status.className = "";
  }, 750);
};

// Restores select box and checkbox state using the preferences
// stored in browser.storage.
const restoreOptions = async () => {
  let items = await loadSavedData();
  document.getElementById("disCreateWF").checked = items.disableCreateWF;
  document.getElementById("enableFunErr").checked = items.enableFunErr;
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveBut").addEventListener("click", saveOptions);
