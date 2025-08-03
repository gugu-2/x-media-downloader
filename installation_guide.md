# X Media Downloader Extension - Complete Installation Guide

## 🚀 Overview
This is a fully functional Brave browser extension that allows you to download videos, images, and GIFs from X.com (Twitter) with a single click. The extension has been completely rewritten for maximum compatibility and reliability.

## 📋 Prerequisites
- Brave Browser (or any Chromium-based browser like Chrome, Edge)
- Basic file management knowledge
- Administrative access to install extensions

## 📁 File Structure
Create a folder called `x-media-downloader` and organize the files as follows:

```
x-media-downloader/
├── manifest.json          # Extension configuration
├── content.js            # Main functionality script
├── background.js         # Download handling & notifications
├── styles.css           # Button and notification styling
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
└── icons/               # Extension icons folder
    ├── icon16.png       # 16x16 toolbar icon
    ├── icon32.png       # 32x32 interface icon
    ├── icon48.png       # 48x48 management icon
    └── icon128.png      # 128x128 store icon
```

## 🖼️ Creating Icons (IMPORTANT)
You MUST create four PNG icon files. Here are some options:

### Option 1: Quick Icon Creation
1. Use any online icon generator (like favicon.io or iconify.design)
2. Search for "download" or "arrow down" icons
3. Generate the following sizes: 16px, 32px, 48px, 128px
4. Save as PNG files with exact names: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

### Option 2: Use Simple Colored Squares (Temporary)
If you just want to test the extension:
1. Create solid colored squares in any image editor
2. Make them blue (#1d9bf0) to match X's theme
3. Save in the required sizes

### Option 3: Professional Icons
- Download from icon libraries like Feather Icons, Heroicons, or Material Icons
- Look for download, save, or arrow-down symbols

## 🔧 Installation Steps

### Step 1: Prepare Files
1. Create a new folder called `x-media-downloader`
2. Copy all the provided code files into this folder
3. Create the `icons` subfolder and add your icon files

### Step 2: Load Extension in Brave
1. Open Brave Browser
2. Navigate to `brave://extensions/` 
3. Toggle **"Developer mode"** in the top-right corner
4. Click **"Load unpacked"**
5. Select the `x-media-downloader` folder
6. The extension should now appear in your extensions list

### Step 3: Enable Extension
1. Make sure the extension toggle is **ON**
2. Pin the extension to your toolbar (optional but recommended)
3. Grant any requested permissions

## 🎯 How to Use

### Method 1: Download Buttons
1. Visit **x.com** (or twitter.com)
2. Hover over any video, audio, or image
3. Look for the **download icon** (appears on hover)
4. Click the download button to start downloading

### Method 2: Right-Click Menu
1. Right-click on any media element
2. Select **"Download with X Media Downloader"**
3. The download will start automatically

### Method 3: Extension Popup
1. Click the extension icon in your toolbar
2. View download statistics and settings
3. Configure auto-download and video quality preferences
4. Access the downloads folder directly

## 📂 Download Location
All media will be saved to: `Downloads/X-Media-Downloads/`

Files are automatically named with timestamps to avoid conflicts:
- `x-media-2024-01-15T10-30-45-123Z.mp4`
- `x-media-2024-01-15T10-31-02-456Z.jpg`

## ⚙️ Features

### ✅ Supported Media Types
- **Videos**: MP4, WebM
- **Audio**: MP3, WAV
- **Images**: JPG, PNG, GIF
- **Embedded media** in tweets

### 🎛️ Settings
- **Auto-download**: Enable/disable automatic downloads
- **Video quality**: Choose preferred quality (highest, high, medium, low)
- **Download statistics**: Track daily and total downloads

### 🔔 Smart Features
- **Hover-to-show**: Download buttons appear only when hovering
- **Non-intrusive**: Buttons don't interfere with X.com's interface
- **Responsive design**: Works on mobile and desktop views
- **Error handling**: Shows notifications for success/failure
- **Duplicate prevention**: Automatic file renaming to avoid conflicts

## 🐛 Troubleshooting

### Downloads Not Starting
1. Check if you're on x.com or twitter.com
2. Ensure the extension has proper permissions
3. Try refreshing the page
4. Check if downloads are blocked in browser settings

### Download Buttons Not Appearing
1. Try hovering over media elements
2. Refresh the page and wait for content to load
3. Check if the extension is enabled
4. Inspect browser console for errors

### Permission Issues
1. Go to `brave://extensions/`
2. Click "Details" on the X Media Downloader
3. Ensure all permissions are granted
4. Try removing and reinstalling the extension

### Quality Issues
1. Open extension popup
2. Adjust video quality settings
3. Note: Available quality depends on source media

## 🔒 Privacy & Security

### Data Collection
- ✅ **No data collection**: Extension works locally
- ✅ **No tracking**: No analytics or user tracking
- ✅ **No external servers**: All processing happens in your browser

### Permissions Explained
- **activeTab**: Access current tab content to find media
- **downloads**: Save files to your downloads folder
- **storage**: Remember your preferences
- **host_permissions**: Access X.com and media URLs

## 🔄 Updates & Maintenance

### Updating the Extension
1. Download updated files
2. Replace old files in the extension folder
3. Go to `brave://extensions/`
4. Click the refresh icon on the extension
5. Reload any open X.com tabs

### Backup Settings
Your settings are stored locally. To backup:
1. Open extension popup
2. Note your current settings
3. After reinstalling, reconfigure as needed

## ⚠️ Legal Considerations

### Important Notes
- Only download media you have rights to
- Respect copyright and intellectual property
- Follow X.com's Terms of Service
- Use responsibly and ethically

### Terms Compliance
This extension is for personal use only. Users are responsible for ensuring their downloads comply with:
- Copyright laws
- Platform terms of service
- Local regulations
- Fair use guidelines

## 🆘 Support

### Common Issues
- **Extension not loading**: Check file structure and manifest.json
- **Icons missing**: Ensure all three icon files are present
- **Downloads failing**: Check browser download settings
- **Buttons not working**: Verify content script is loading

### Getting Help
1. Check browser console for error messages
2. Verify all files are correctly placed
3. Ensure extension permissions are granted
4. Try disabling other extensions that might conflict

## 🚀 Advanced Configuration

### Custom Download Path
To change the download folder, modify this line in `background.js`:
```javascript
const downloadPath = `X-Media-Downloads/${filename}`;
```

### Quality Settings
Modify the quality detection logic in `content.js` to prefer specific formats or resolutions.

### Button Styling
Customize the appearance by editing `styles.css` - change colors, sizes, or positioning.

---

**🎉 Enjoy downloading media from X.com with ease!**

*Remember to use this extension responsibly and in compliance with all applicable laws and terms of service.*