// X Media Downloader - Enhanced Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log('X Media Downloader installed');
  
  // Initialize storage
  chrome.storage.local.set({
    totalDownloads: 0,
    downloadsToday: 0,
    lastResetDate: new Date().toDateString(),
    settings: {
      downloadPath: 'X-Media-Downloads',
      showNotifications: true,
      autoIncrement: true
    }
  });

  // Create context menu
  chrome.contextMenus.create({
    id: 'download-media',
    title: 'Download with X Media Downloader',
    contexts: ['image', 'video', 'link'],
    documentUrlPatterns: ['*://x.com/*', '*://twitter.com/*']
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    handleDownload(request)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Download error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'download-media') {
    const url = info.srcUrl || info.linkUrl;
    const type = info.mediaType || 'unknown';
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'downloadFromContext',
      url: url,
      type: type
    });
  }
});

async function handleDownload(request) {
  try {
    const { url, filename, type } = request;
    
    if (!url) {
      throw new Error('No URL provided');
    }

    // Get settings
    const storage = await chrome.storage.local.get(['settings']);
    const settings = storage.settings || {};
    const downloadPath = settings.downloadPath || 'X-Media-Downloads';
    
    // Create full filename with path
    const fullPath = `${downloadPath}/${filename || 'download'}`;
    
    console.log('Starting download:', { url, fullPath, type });
    
    // Start download
    const downloadId = await chrome.downloads.download({
      url: url,
      filename: fullPath,
      saveAs: false,
      conflictAction: 'uniquify'
    });

    console.log('Download started with ID:', downloadId);
    
    // Update statistics
    await updateDownloadStats();
    
    // Set up download completion listener
    const downloadListener = (delta) => {
      if (delta.id === downloadId) {
        if (delta.state?.current === 'complete') {
          console.log('Download completed:', filename);
          chrome.downloads.onChanged.removeListener(downloadListener);
          
          if (settings.showNotifications !== false) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'X Media Downloader',
              message: `Downloaded: ${filename}`
            });
          }
        } else if (delta.state?.current === 'interrupted') {
          console.error('Download interrupted:', filename);
          chrome.downloads.onChanged.removeListener(downloadListener);
          
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'X Media Downloader',
            message: `Download failed: ${filename}`
          });
        }
      }
    };
    
    chrome.downloads.onChanged.addListener(downloadListener);
    
    return { success: true, downloadId };
    
  } catch (error) {
    console.error('Download error:', error);
    
    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'X Media Downloader',
      message: `Download failed: ${error.message}`
    });
    
    return { success: false, error: error.message };
  }
}

async function updateDownloadStats() {
  try {
    const storage = await chrome.storage.local.get([
      'totalDownloads', 
      'downloadsToday', 
      'lastResetDate'
    ]);
    
    const today = new Date().toDateString();
    let downloadsToday = storage.downloadsToday || 0;
    
    // Reset daily count if new day
    if (storage.lastResetDate !== today) {
      downloadsToday = 0;
    }
    
    // Update counts
    const totalDownloads = (storage.totalDownloads || 0) + 1;
    downloadsToday += 1;
    
    await chrome.storage.local.set({
      totalDownloads,
      downloadsToday,
      lastResetDate: today
    });
    
    console.log('Stats updated:', { totalDownloads, downloadsToday });
    
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  // This will open the popup automatically due to default_popup in manifest
  console.log('Extension icon clicked');
});

// Listen for tab updates to re-inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      (tab.url?.includes('x.com') || tab.url?.includes('twitter.com'))) {
    
    // Re-inject content script for dynamic navigation
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content_script.js']
    }).catch(error => {
      // Ignore errors (script might already be injected)
      console.log('Content script injection skipped:', error.message);
    });
  }
});

// Utility function to get file size (for future use)
async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const size = response.headers.get('content-length');
    return size ? parseInt(size) : 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}