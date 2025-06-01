![HOTSTAR IPL AD Muter](chrome/128.png?raw=true) 
# Hotstar Ad Muter (Enhanced Fork)

> **Fork Notice**: This is an enhanced fork of the original [Hotstar IPL Ad Muter](https://github.com/pea1bee/hotstar-ipl-ad-mute) by pea1bee. This version adds automatic ad detection and other improvements.

This browser extension automatically mutes ads in live sport streams on Hotstar (like IPL) by intercepting Hotstar's ad tracking pixels. The enhanced version includes:

- **Automatic ad detection** (no need to manually add most ad IDs)
- **Persistent storage** of detected ads between sessions
- **Smarter duration detection** from ad identifiers
- **Both Chrome and Firefox support**

## Key Improvements Over Original

✔ **No more manual updates** - Automatically detects ads by their patterns  
✔ **Future-proof** - Learns new ad formats without code changes  
✔ **More ad coverage** - Catches ads based on duration markers (like "15s", "20sEng")  
✔ **Cross-browser** - Works in both Chrome and Firefox  

## Installation

### Google Chrome/Chromium
1. **Clone** this repository:
   ```bash
   git clone https://github.com/himanshugupta2077/hotstar-ipl-ad-mute
   ```
2. Go to `chrome://extensions/`
3. Enable **Developer Mode**
4. Click **Load unpacked** and select the `chrome` folder

### Mozilla Firefox
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` in the `firefox` folder

## Features

### Automatic Mode (Default)
The extension will automatically mute:
- All ads matching known patterns (like duration codes)
- Pre-configured problematic ads (Parle Marie, Policy Bazaar, etc.)
- Newly detected ads (logged to console)

### Manual Control
You can still customize behavior in `background.js`:
```js
// Set to true to mute ALL ads aggressively
const MUTE_ALL_ADS = false;

// Add your custom ad identifiers here
const knownAdIds = new Set([
  "PARLE_MARIE",
  "POLICY_BAZAAR",
  // Add your custom ads here
]);
```

## Finding New Ads
During live streams, check the console (Inspect views) for messages like:
```
New ad detected: BRAND_NEW_AD_15sEng
```
These will be automatically muted in future sessions.

## License
MIT © 2025 (Original by pea1bee, Enhanced by Himanshu Gupta)
