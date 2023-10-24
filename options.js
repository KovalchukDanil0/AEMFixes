// Saves options to browser.storage
const saveOptions = () => {
  const hideWFButtonJira = document.getElementById("hideWFButtonJira").checked;

  browser.storage.sync.set({ hideWFButtonJira: hideWFButtonJira }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in browser.storage.
const restoreOptions = () => {
  browser.storage.sync.get({ hideWFButtonJira: true }, (items) => {
    document.getElementById("color").value = items.favoriteColor;
    document.getElementById("like").checked = items.likesColor;
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
