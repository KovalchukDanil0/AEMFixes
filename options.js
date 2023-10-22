// Saves options to chrome.storage
const saveOptions = () => {
  const hideWFButtonJira = document.getElementById("hideWFButtonJira").checked;

  chrome.storage.sync.set({ hideWFButtonJira: hideWFButtonJira }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({ hideWFButtonJira: true }, (items) => {
    document.getElementById("color").value = items.favoriteColor;
    document.getElementById("like").checked = items.likesColor;
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
