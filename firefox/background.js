const knownAdIds = new Set([
  "PARLE_MARIE",
  "KAMLA_PASAND",
  "VIMAL",
  "MY11C",
  "POKERBAAZI",
  "POKER_BAAZI",
  "POLICY_BAZAAR",
  "PR-25-011191_TATAIPL2025_IPL18_ipl18HANGOUTEVR20sEng_English_VCTA_NA",
  "PR-25-012799_TATAIPL2025_IPL18_IPL18BHOJPURI20sBHOmob_Hindi_VCTA_20"
]);

const durationRegexes = [
  /(\d{1,3})s(?:Eng(?:lish)?|Hin(?:di)?)/i,
  /(?:HIN|ENG|HINDI|ENGLISH)[^\d]*(\d{1,3})/i
];

let detectedAds = new Set();
let isFirstRun = true;

console.log("Hotstar Adblocker extension loaded (Firefox)");

async function muteTabsForDuration(durationSec, adName) {
  console.log(`Muting ${adName} for ${durationSec} seconds`);
  
  const tabs = await browser.tabs.query({ url: "*://*.hotstar.com/*" });

  for (const tab of tabs) {
    if (!tab.mutedInfo.muted) {
      await browser.tabs.update(tab.id, { muted: true });
      
      setTimeout(() => {
        browser.tabs.get(tab.id).then(updatedTab => {
          if (updatedTab && updatedTab.mutedInfo.muted) {
            browser.tabs.update(tab.id, { muted: false });
          }
        });
      }, (durationSec * 1000) - 100);
    }
  }
}

function shouldMuteAd(adName) {
  // Check known ads
  for (const id of knownAdIds) {
    if (adName.includes(id)) return true;
  }
  
  // Check ad duration patterns
  for (const regex of durationRegexes) {
    if (regex.test(adName)) return true;
  }
  
  return false;
}

function getAdDuration(adName) {
  for (const regex of durationRegexes) {
    const match = adName.match(regex);
    if (match) return parseInt(match[1], 10);
  }
  return 10; // default duration
}

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const adName = url.searchParams.get("adName");
    
    if (adName) {
      console.log(`Ad detected: ${adName}`);
      
      if (shouldMuteAd(adName)) {
        const durationSec = getAdDuration(adName);
        await muteTabsForDuration(durationSec, adName);
        
        if (!detectedAds.has(adName)) {
          detectedAds.add(adName);
          console.log(`New ad detected: ${adName}`);
          
          browser.storage.local.get(['detectedAds']).then(result => {
            const storedAds = result.detectedAds || [];
            if (!storedAds.includes(adName)) {
              storedAds.push(adName);
              browser.storage.local.set({ detectedAds: storedAds });
            }
          });
        }
      }
    }
  },
  {
    urls: ["*://bifrost-api.hotstar.com/v1/events/track/ct_impression*"]
  }
);

// Load stored ads on startup
browser.storage.local.get(['detectedAds']).then(result => {
  if (result.detectedAds) {
    result.detectedAds.forEach(ad => detectedAds.add(ad));
    if (isFirstRun) {
      console.log(`Loaded ${result.detectedAds.length} previously detected ads`);
      isFirstRun = false;
    }
  }
});