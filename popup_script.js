// X Media Downloader - Enhanced Popup Script
document.addEventListener('DOMContentLoaded', async function() {
  await initializePopup();
});

async function initializePopup() {
  try {
    await loadSettings();
    await updateStats();
    await checkTabStatus();
    setupEventListeners();
    console.log('Popup initialized successfully');
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to initialize extension');
  }
}

function setupEventListeners() {
  // Settings toggles
  const notificationsToggle = document.getElementById('notifications');
  const autoIncrementToggle = document.getElementById('autoIncrement');
  const qualitySelect = document.getElementById('quality');

  notificationsToggle?.addEventListener('change', async function() {
    await updateSetting('showNotifications', this.checked);
  });

  autoIncrementToggle?.addEventListener('change', async function() {
    await updateSetting('autoIncrement', this.checked);
  });

  qualitySelect?.addEventListener('change', async function() {
    await updateSetting('quality', this.value);
  });

  // Action buttons
  const openFolderBtn = document.getElementById('openFolder');
  const clearStatsBtn = document.getElementById('clearStats');

  openFolderBtn?.addEventListener('click', openDownloadsFolder);
  clearStatsBtn?.addEventListener('click', clearStatistics);
}

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {
      showNotifications: true,
      autoIncrement: true,
      quality: 'highest'
    };

    // Update UI elements
    const notificationsToggle = document.getElementById('notifications');
    const autoIncrementToggle = document.getElementById('autoIncrement');
    const qualitySelect = document.getElementById('quality');

    if (notificationsToggle) {
      notificationsToggle.checked = settings.showNotifications !== false;
    }
    
    if (autoIncrementToggle) {
      autoIncrementToggle.checked = settings.autoIncrement !== false;
    }
    
    if (qualitySelect) {
      qualitySelect.value = settings.quality || 'highest';
    }

  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function updateSetting(key, value) {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};
    settings[key] = value;
    
    await chrome.storage.local.set({ settings });
    console.log(`Setting updated: ${key} = ${value}`);
  } catch (error) {
    console.error('Error updating setting:', error);
  }
}

async function updateStats() {
  try {
    const result = await chrome.storage.local.get([
      'totalDownloads',
      'downloadsToday',
      'lastResetDate'
    ]);

    const today = new Date().toDateString();
    let downloadsToday = result.downloadsToday || 0;

    // Reset daily count if it's a new day
    if (result.lastResetDate !== today) {
      downloadsToday = 0;
      await chrome.storage.local.set({
        downloadsToday: 0,
        lastResetDate: today
      });
    }

    // Update display
    const todayElement = document.getElementById('todayCount');
    const totalElement = document.getElementById('totalCount');

    if (todayElement) {
      todayElement.textContent = downloadsToday.toString();
    }
    
    if (totalElement) {
      totalElement.textContent = (result.totalDownloads || 0).toString();
    }

  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

async function checkTabStatus() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (!statusIndicator || !statusText) return;

    if (currentTab?.url?.includes('x.com') || currentTab?.url?.includes('twitter.com')) {
      statusIndicator.className = 'status-indicator active';
      statusText.textContent = 'Active on X.com - Ready to download!';
    } else {
      statusIndicator.className = 'status-indicator inactive';
      statusText.textContent = 'Navigate to X.com to start downloading';
    }
  } catch (error) {
    console.error('Error checking tab status:', error);
    const statusText = document.getElementById('statusText');
    if (statusText) {
      statusText.textContent = 'Status unavailable';
    }
  }
}

async function openDownloadsFolder() {
  try {
    const button = document.getElementById('openFolder');
    if (button) {
      button.classList.add('loading');
      button.textContent = 'Opening...';
    }

    await chrome.downloads.showDefaultFolder();
    
    setTimeout(() => {
      if (button) {
        button.classList.remove('loading');
        button.innerHTML = '📁 Open Downloads Folder';
      }
    }, 1000);

  } catch (error) {
    console.error('Error opening downloads folder:', error);
    showError('Could not open downloads folder');
    
    const button = document.getElementById('openFolder');
    if (button) {
      button.classList.remove('loading');
      button.innerHTML = '📁 Open Downloads Folder';
    }
  }
}

async function clearStatistics() {
  try {
    const button = document.getElementById('clearStats');
    if (button) {
      button.classList.add('loading');
      button.textContent = 'Clearing...';
    }

    await chrome.storage.local.set({
      totalDownloads: 0,
      downloadsToday: 0,
      lastResetDate: new Date().toDateString()
    });

    await updateStats();
    showSuccess('Statistics cleared successfully!');

    setTimeout(() => {
      if (button) {
        button.classList.remove('loading');
        button.innerHTML = '🗑️ Clear Statistics';
      }
    }, 1000);

  } catch (error) {
    console.error('Error clearing statistics:', error);
    showError('Could not clear statistics');
    
    const button = document.getElementById('clearStats');
    if (button) {
      button.classList.remove('loading');
      button.innerHTML = '🗑️ Clear Statistics';
    }
  }
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showError(message) {
  showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    left: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-size: 13px;
    font-weight: 500;
    z-index: 10000;
    animation: slideDown 0.3s ease;
    text-align: center;
  `;

  // Set background color based on type
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  };
  
  notification.style.background = colors[type] || colors.info;
  notification.textContent = message;

  // Add animation keyframes
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideDown 0.3s ease reverse';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'downloadComplete') {
    updateStats();
    showSuccess('Download completed!');
  } else if (request.action === 'downloadFailed') {
    showError('Download failed');
  }
});

// Refresh stats when popup is opened
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    updateStats();
    checkTabStatus();
  }
});

// Handle popup focus
window.addEventListener('focus', function() {
  updateStats();
  checkTabStatus();
});

// Error handling for uncaught errors
window.addEventListener('error', function(event) {
  console.error('Popup error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});