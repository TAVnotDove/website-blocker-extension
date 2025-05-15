const defaultUrls = [];

const chromeSyncStorage = chrome.storage.sync;

const body = document.querySelector("body");

const blockedList = document.getElementById("wb-website-list");
const urlInput = document.getElementById("wb-website-input");
const addButton = document.getElementById("wb-add-website-button");

let currentUrl = "";
let chromeBlockedUrls = [];

// reset default states
// chromeSyncStorage.clear();

initData();

// url and block button logic
urlInput.addEventListener("input", (e) => {
  if (
    addButton.disabled &&
    (e.currentTarget.value.trim() !== "" ||
      !chromeBlockedUrls.includes(e.currentTarget.value.trim()))
  ) {
    addButton.disabled = false;
  } else if (
    !addButton.disabled &&
    (e.currentTarget.value.trim() === "" ||
      chromeBlockedUrls.includes(e.currentTarget.value.trim()))
  ) {
    addButton.disabled = true;
  }
});

// add block button logic
addButton.addEventListener("click", function () {
  const url = urlInput.value.trim();
  if (url) {
    chromeSyncStorage.get(["blockedUrls"]).then((result) => {
      const blockedUrls = result.blockedUrls || [];
      chromeBlockedUrls = result.blockedUrls.slice().map((x) => x.url);

      if (!chromeBlockedUrls.includes(url)) {
        blockedUrls.push({ url, enabled: true });
        chromeSyncStorage.set({ blockedUrls }).then(() => {
          addBlockedUrlToList(url);
          urlInput.value = "";
          addButton.disabled = true;
          addContainer.style.display = "none";

          chrome.runtime.sendMessage({ action: "updateBlockList" });
        });
      }
    });
  }
});
/////////////////////////

function initData() {
  chromeSyncStorage.get(["blockedUrls"]).then((result) => {
    if (Object.keys(result).length > 0) {
      //add to list
      chromeBlockedUrls = result.blockedUrls.slice().map((x) => x.url);
      const listItems = chromeBlockedUrls
        .map(
          (bw) =>
            `
              <li>${bw}</li>
            `
        )
        .join("\n");

      blockedList.innerHTML = listItems;

    } else {
      chromeSyncStorage
        .set({
          blockedUrls: defaultUrls.map((x) => ({
            url: x,
            enabled: true,
          })),
        })
        .then(() => {
          chrome.runtime.sendMessage({ action: "updateBlockList" });

          defaultUrls.forEach((x) => {
            addBlockedUrlToList(x);
          });

        });
    }
  });
}

function addBlockedUrlToList(url) {
  const li = document.createElement("li");

  li.textContent = url;

  blockedList.appendChild(li);

  chromeBlockedUrls.push(url);
}

function blockUrl() {
  setTimeout(() => {
    while (document.styleSheets.length > 0) {
      if (
        document.styleSheets[0].ownerNode &&
        document.styleSheets[0].ownerNode.parentNode
      ) {
        document.styleSheets[0].ownerNode.parentNode.removeChild(
          document.styleSheets[0].ownerNode
        );
      }
    }

    body.innerHTML = "<h1>Access Blocked</h1>";
    body.style.textAlign = "center";
    body.style.fontSize = "30px";
    body.style.marginTop = "20%";
    body.style.color = "#ff0000";
    body.style.backgroundColor = "#242424";
  }, 1000);
}

// add screen
addButton.addEventListener("click", () => {
  addContainer.style.display = "block";

  urlInput.value = "";
  addButton.disabled = true;
});
