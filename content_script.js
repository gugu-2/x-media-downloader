// X Media Downloader - Enhanced Content Script
(() => {
  'use strict';

  class XMediaDownloader {
    constructor() {
      this.downloadedUrls = new Set();
      this.observer = null;
      this.isProcessing = false;
      this.init();
    }

    init() {
      console.log('X Media Downloader: Initializing...');
      this.setupStyles();
      this.startObserver();
      this.processExistingMedia();
      this.setupMessageListener();
    }

    setupMessageListener() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'downloadFromContext') {
          this.downloadMediaFromUrl(request.url, request.type);
          sendResponse({ success: true });
        }
      });
    }

    setupStyles() {
      if (document.getElementById('x-downloader-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'x-downloader-styles';
      style.textContent = `
        .x-download-btn {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          width: 32px !important;
          height: 32px !important;
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border: none !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 9999 !important;
          transition: all 0.2s ease !important;
          opacity: 0 !important;
          visibility: hidden !important;
          font-size: 14px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        }
        
        .x-download-btn:hover {
          background: rgba(29, 155, 240, 0.9) !important;
          transform: scale(1.1) !important;
        }
        
        .x-download-btn.show {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        .x-media-container:hover .x-download-btn {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        .x-download-notification {
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          padding: 12px 20px !important;
          border-radius: 8px !important;
          color: white !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          z-index: 99999 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
          animation: slideInFromRight 0.3s ease !important;
          max-width: 300px !important;
        }
        
        .x-download-notification.success {
          background: #10b981 !important;
        }
        
        .x-download-notification.error {
          background: #ef4444 !important;
        }
        
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    startObserver() {
      this.observer = new MutationObserver((mutations) => {
        if (this.isProcessing) return;
        
        let shouldProcess = false;
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            for (let node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (this.containsMedia(node)) {
                  shouldProcess = true;
                  break;
                }
              }
            }
          }
        });

        if (shouldProcess) {
          clearTimeout(this.processTimeout);
          this.processTimeout = setTimeout(() => {
            this.processExistingMedia();
          }, 500);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    containsMedia(element) {
      return element.querySelector && (
        element.querySelector('video') ||
        element.querySelector('img[src*="media"]') ||
        element.querySelector('[data-testid="videoPlayer"]') ||
        element.querySelector('[data-testid="tweetPhoto"]') ||
        element.matches('video, img')
      );
    }

    processExistingMedia() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        // Find all media containers
        const mediaSelectors = [
          '[data-testid="videoPlayer"]',
          '[data-testid="tweetPhoto"]',
          'video',
          'img[src*="pbs.twimg.com"]',
          'img[src*="video_thumb"]',
          '[role="button"] img',
          'div[style*="background-image"]'
        ];

        mediaSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => this.processMediaElement(element));
        });

      } catch (error) {
        console.error('Error processing media:', error);
      } finally {
        this.isProcessing = false;
      }
    }

    processMediaElement(element) {
      if (element.dataset.xDownloaderProcessed) return;
      element.dataset.xDownloaderProcessed = 'true';

      const container = this.findMediaContainer(element);
      if (!container) return;

      // Make container relative if not already
      const containerStyle = window.getComputedStyle(container);
      if (containerStyle.position === 'static') {
        container.style.position = 'relative';
      }
      container.classList.add('x-media-container');

      // Skip if button already exists
      if (container.querySelector('.x-download-btn')) return;

      const downloadBtn = this.createDownloadButton();
      const mediaInfo = this.extractMediaInfo(element);
      
      if (mediaInfo.url) {
        downloadBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.downloadMedia(mediaInfo);
        });

        container.appendChild(downloadBtn);
      }
    }

    findMediaContainer(element) {
      // Try to find the best container for positioning the button
      let container = element;
      
      // For videos, find the video player container
      if (element.tagName === 'VIDEO') {
        container = element.closest('[data-testid="videoPlayer"]') || 
                   element.closest('div[style*="height"]') || 
                   element.parentElement;
      }
      
      // For images, find the photo container
      if (element.tagName === 'IMG') {
        container = element.closest('[data-testid="tweetPhoto"]') || 
                   element.closest('div[role="button"]') || 
                   element.closest('a') || 
                   element.parentElement;
      }

      return container;
    }

    createDownloadButton() {
      const button = document.createElement('button');
      button.className = 'x-download-btn';
      button.innerHTML = '⬇';
      button.title = 'Download media';
      button.setAttribute('aria-label', 'Download media');
      return button;
    }

    extractMediaInfo(element) {
      const info = { url: null, type: 'unknown', filename: null };

      if (element.tagName === 'VIDEO') {
        info.url = element.src || element.currentSrc;
        info.type = 'video';
        
        // Try to get source with highest quality
        const sources = element.querySelectorAll('source');
        if (sources.length > 0) {
          info.url = sources[sources.length - 1].src;
        }
      }
      
      else if (element.tagName === 'IMG') {
        info.url = element.src;
        info.type = this.detectImageType(element.src);
        
        // Try to get higher quality version
        if (info.url.includes('name=small')) {
          info.url = info.url.replace('name=small', 'name=large');
        } else if (info.url.includes('name=medium')) {
          info.url = info.url.replace('name=medium', 'name=large');
        }
      }
      
      // Handle background images
      else if (element.style.backgroundImage) {
        const match = element.style.backgroundImage.match(/url\("?([^"]*)"?\)/);
        if (match) {
          info.url = match[1];
          info.type = 'image';
        }
      }

      // Generate filename
      if (info.url) {
        info.filename = this.generateFilename(info.url, info.type);
      }

      return info;
    }

    detectImageType(url) {
      if (url.includes('.gif') || url.includes('tweet_video_thumb')) {
        return 'gif';
      }
      return 'image';
    }

    generateFilename(url, type) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = this.getFileExtension(url, type);
      return `x-media-${timestamp}.${extension}`;
    }

    getFileExtension(url, type) {
      // Extract extension from URL
      const urlPath = url.split('?')[0];
      const match = urlPath.match(/\.([a-zA-Z0-9]+)$/);
      
      if (match) {
        const ext = match[1].toLowerCase();
        if (['mp4', 'webm', 'mov', 'avi', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          return ext;
        }
      }

      // Default extensions
      const defaults = {
        video: 'mp4',
        image: 'jpg',
        gif: 'gif'
      };
      
      return defaults[type] || 'bin';
    }

    async downloadMedia(mediaInfo) {
      if (!mediaInfo.url) {
        this.showNotification('No media URL found', 'error');
        return;
      }

      if (this.downloadedUrls.has(mediaInfo.url)) {
        this.showNotification('Already downloading this media', 'error');
        return;
      }

      this.downloadedUrls.add(mediaInfo.url);

      try {
        // Send download request to background script
        const response = await chrome.runtime.sendMessage({
          action: 'download',
          url: mediaInfo.url,
          filename: mediaInfo.filename,
          type: mediaInfo.type
        });

        if (response && response.success) {
          this.showNotification(`Download started: ${mediaInfo.filename}`, 'success');
        } else {
          throw new Error('Download request failed');
        }
      } catch (error) {
        console.error('Download error:', error);
        this.showNotification('Download failed. Please try again.', 'error');
        this.downloadedUrls.delete(mediaInfo.url);
      }
    }

    downloadMediaFromUrl(url, type) {
      const mediaInfo = {
        url: url,
        type: type || 'unknown',
        filename: this.generateFilename(url, type || 'unknown')
      };
      
      this.downloadMedia(mediaInfo);
    }

    showNotification(message, type = 'success') {
      // Remove existing notifications
      const existing = document.querySelectorAll('.x-download-notification');
      existing.forEach(el => el.remove());

      const notification = document.createElement('div');
      notification.className = `x-download-notification ${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 4000);
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
      
      // Remove all download buttons
      const buttons = document.querySelectorAll('.x-download-btn');
      buttons.forEach(button => button.remove());
      
      // Remove styles
      const styles = document.getElementById('x-downloader-styles');
      if (styles) styles.remove();
    }
  }

  // Initialize the downloader
  let downloader = null;

  function initDownloader() {
    if (downloader) {
      downloader.destroy();
    }
    downloader = new XMediaDownloader();
  }

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDownloader);
  } else {
    initDownloader();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (downloader) {
      downloader.destroy();
    }
  });

  // Re-initialize on navigation (for SPA behavior)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(initDownloader, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

})();