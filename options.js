// Saves options to browser.storage
const saveOptions = async () => {
  const disableCreateWF = document.getElementById("disCreateWF").checked;

  await browser.storage.sync.set({ disableCreateWF: disableCreateWF });
  const status = document.getElementById("status");
  status.textContent = "Options saved.";
  setTimeout(() => {
    status.textContent = "";
  }, 750);
};

// Restores select box and checkbox state using the preferences
// stored in browser.storage.
const restoreOptions = async () => {
  let items = await loadSavedData();
  document.getElementById("disCreateWF").checked = items.disableCreateWF;
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveBut").addEventListener("click", saveOptions);
