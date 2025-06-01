const knownAdIds = new Set([
  "PARLE_MARIE",
  "KAMLA_PASAND",
  "VIMAL",
  "MY11C",
  "POKERBAAZI",
  "POKER_BAAZI",
  "POLICY_BAZAAR",
  "PR-25-011191_TATAIPL2025_IPL18_ipl18HANGOUTEVR20sEng_English_VCTA_NA",
  "PR-25-012799_TATAIPL2025_IPL18_IPL18BHOJPURI20sBHOmob_Hindi_VCTA_20",
  "REV_GOOGLE_PAY_PBSK_MUM_DATA_SPEED_HINDI_HD_25_IPLL25",
  "CPH000020892_SAMSUNG_S25_ULTRA_INSWING_FILM_HIN_15_IPL25_180525"
]);

const durationRegexes = [
  /(\d{1,3})s(?:Eng(?:lish)?|Hin(?:di)?)/i,
  /(?:HIN|ENG|HINDI|ENGLISH)[^\d]*(\d{1,3})/i
];

// Storage for detected ad IDs
let detectedAds = new Set();
let isFirstRun = true;

console.log("Hotstar Adblocker extension loaded");

// Function to mute tabs for a duration
async function muteTabsForDuration(durationSec, adName) {
  console.log(`Muting ${adName} for ${durationSec} seconds`);
  
  const tabs = await chrome.tabs.query({ url: "*://*.hotstar.com/*" });

  for (const tab of tabs) {
    if (!tab.mutedInfo.muted) {
      chrome.tabs.update(tab.id, { muted: true });
      
      setTimeout(() => {
        chrome.tabs.get(tab.id, (updatedTab) => {
          if (updatedTab && updatedTab.mutedInfo.muted) {
            chrome.tabs.update(tab.id, { muted: false });
          }
        });
      }, (durationSec * 1000) - 100);
    }
  }
}

// Function to check if ad should be muted
function shouldMuteAd(adName) {
  // Check if this is a known ad
  for (const id of knownAdIds) {
    if (adName.includes(id)) {
      return true;
    }
  }
  
  // Check ad duration patterns (typical ad formats)
  for (const regex of durationRegexes) {
    if (regex.test(adName)) {
      return true;
    }
  }
  
  return false;
}

// Function to extract duration from ad name
function getAdDuration(adName) {
  for (const regex of durationRegexes) {
    const match = adName.match(regex);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return 10; // default duration
}

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const adName = url.searchParams.get("adName");
    
    if (adName) {
      console.log(`Ad detected: ${adName}`);
      
      // Check if we should mute this ad
      if (shouldMuteAd(adName)) {
        const durationSec = getAdDuration(adName);
        await muteTabsForDuration(durationSec, adName);
        
        // Track newly detected ads (not in our known list)
        if (!detectedAds.has(adName)) {
          detectedAds.add(adName);
          console.log(`New ad detected: ${adName}`);
          
          // Optionally store this for future reference
          chrome.storage.local.get(['detectedAds'], (result) => {
            const storedAds = result.detectedAds || [];
            if (!storedAds.includes(adName)) {
              storedAds.push(adName);
              chrome.storage.local.set({ detectedAds: storedAds });
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

// Load previously detected ads on startup
chrome.storage.local.get(['detectedAds'], (result) => {
  if (result.detectedAds) {
    result.detectedAds.forEach(ad => detectedAds.add(ad));
    if (isFirstRun) {
      console.log(`Loaded ${result.detectedAds.length} previously detected ads`);
      isFirstRun = false;
    }
  }
});
