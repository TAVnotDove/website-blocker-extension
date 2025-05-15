let blockedUrls = [];
const chromeSyncStorage = chrome.storage.sync;

chromeSyncStorage.get(["blockedUrls"]).then((result) => {
  if (Object.keys(result).length > 0) {
    blockedUrls = result.blockedUrls.map((x) => x.url);

    // Listen for when a tab is updated or the user switches tabs
    chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
      if (changeInfo.status === "complete") {
        checkAndBlockSite(tab);
      }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      chrome.tabs.get(activeInfo.tabId, checkAndBlockSite);
    });

    // Function to check if the current website is in the block list
    function checkAndBlockSite(tab) {
      const url = new URL(tab.url);
      const currentHost = url.host;

      if (blockedUrls.includes(currentHost) && enabledUrls[currentHost]) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Clear the page and show the blocked message
            blockUrl();
          },
        });
      }
    }
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (
    areaName === "sync" &&
    changes.blockedUrls &&
    changes.blockedUrls.newValue
  ) {
    blockedUrls = changes.blockedUrls.newValue.map((x) => x.url) || [];
  }
});
