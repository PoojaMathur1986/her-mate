# PWA Setup for HerMate

HerMate is now configured as a Progressive Web App (PWA). Here's what's been set up:

## Files Created/Modified

### New Files

- **`public/manifest.json`** - PWA manifest with app metadata, icons, and display settings
- **`public/sw.js`** - Service Worker for offline support and caching
- **`public/offline.html`** - Fallback offline page
- **`app/lib/PWARegister.tsx`** - Service Worker registration component

### Modified Files

- **`app/layout.tsx`** - Added PWA metadata, manifest link, and service worker registration

## Features Enabled

### 1. **Install as App**

- Users can install HerMate on their home screen (iOS/Android)
- Appears as a standalone app icon
- Opens in app mode without browser UI

### 2. **Offline Support**

- Service Worker caches app shell and assets
- App remains accessible even without internet
- Shows friendly offline page when disconnected
- Data syncs when connection returns

### 3. **Native-like Experience**

- Standalone display mode
- Custom theme color (#F5B7D1)
- Status bar styling
- App shortcuts and metadata

### 4. **Icons**

- Favicon (16x16, 32x32)
- Apple touch icon (180x180)
- Android chrome icons (192x192, 512x512)
- All icons configured in manifest.json

## Installation Instructions

### On Android

1. Open HerMate in Chrome
2. Tap the menu (three dots) → "Install app"
3. Confirm installation
4. App will be added to home screen

### On iOS (Safari)

1. Open HerMate in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Choose a name and add
5. App will be added to home screen

## Testing PWA Features

### Test Offline Mode

1. Install the app
2. Open DevTools → Application → Service Workers
3. Check "Offline" and reload
4. App should remain accessible with cached content

### Check Service Worker

- **Chrome DevTools**: Application → Service Workers
- **Firefox DevTools**: about:debugging#/runtime/this-firefox
- Look for service worker status: "activated and running"

## Cache Strategy

The current service worker uses a **Cache First** strategy:

1. First tries to serve from cache
2. Falls back to network if not cached
3. Caches successful network responses
4. Shows offline page if both cache and network fail

## Future Improvements

- [ ] Implement advanced caching strategies per route
- [ ] Add background sync for mood logs
- [ ] Push notifications for daily mood reminders
- [ ] Periodic background updates
- [ ] Advanced offline-first data synchronization

## Browser Support

- ✅ Chrome/Edge (Android, Windows, Mac, Linux)
- ✅ Firefox (Android, Desktop)
- ✅ Safari (iOS 11.3+, macOS)
- ✅ Samsung Internet
- ✅ Opera

## References

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [Web Manifest Spec](https://www.w3.org/TR/appmanifest/)
