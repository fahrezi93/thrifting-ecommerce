// Push notification event handlers
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: data.icon || '/Logo-App-Mobile.svg',
      badge: data.badge || '/Logo-App-Mobile.svg',
      tag: data.tag || 'notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data.url || '/'
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Workbox service worker code
if(!self.define){let c,e={};const s=(s,a)=>(s=new URL(s+".js",a).href,e[s]||new Promise(e=>{if("document"in self){const c=document.createElement("script");c.src=s,c.onload=e,document.head.appendChild(c)}else c=s,importScripts(s),e()}).then(()=>{let c=e[s];if(!c)throw new Error(`Module ${s} didn't register its module`);return c}));self.define=(a,i)=>{const r=c||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const n=c=>s(c,r),f={module:{uri:r},exports:t,require:n};e[r]=Promise.all(a.map(c=>f[c]||n(c))).then(c=>(i(...c),t))}}define(["./workbox-cb477421"],function(c){"use strict";importScripts(),self.skipWaiting(),c.clientsClaim(),c.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"3dce2d98fd6f956146add5fda2d1d8c0"},{url:"/_next/static/Q9cP1HcQf-vRIlrOWpUyH/_buildManifest.js",revision:"dd845f528880384b5590f8921c56414e"},{url:"/_next/static/Q9cP1HcQf-vRIlrOWpUyH/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1424-0d978277de644893.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/1758-d64992e964bd8e41.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/2239-2bd5df8a0485f1d9.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/2414-0ed587a08314ee1b.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/2417-0e3123e71ca3e66f.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/261b60bd-fa0538c79401f972.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/2800-f67a1d7651c84d5b.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/32-5a633e130121fbfc.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/3482-f5d4e946e03170f5.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/4059-797f9ce869351822.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/4356-1c445e33124e046c.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/4938-d1f285df1a305f63.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/5250-7583bc802b9af931.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/6176-56816f12b018cc5f.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/6691-8a6a78ea73f90332.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/6873-dbb80cb1ab1c76b0.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/7508b87c-c2f56ce7c4708f86.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/7536-30faf0a54e602b77.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/7870-da6b55afb807f3a4.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/7895-0a005fad2fa5c9fd.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/8440-8962f3403b5ed215.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/9638-fb6ec80ddcf0bbbd.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/_not-found-75d417bc233c986c.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/about/page-cc3bb2dc4a6d0dd5.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/admin/categories/page-2122e11a0f642ffe.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/admin/layout-81d37ca0fdbca8f1.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/admin/orders/page-74082cc0e2bd6c86.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/admin/page-0d44ddc78ff3f581.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/admin/products/page-fb5e642ba894445f.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/admin/settings/page-fdbf00f5b2622e98.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/admin/users/page-a3592aece8fc33cc.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/auth/signin/page-f147a549388eba29.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/auth/signup/page-ae2e9a2c523040d6.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/categories/page-d84bcc61f2e24262.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/checkout/page-1fbfdde172f923bf.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/contact/page-ca640180c79ac4fa.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/dashboard/addresses/page-5d9e062a345de6f9.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/dashboard/layout-772dfe9b91e94f9c.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/dashboard/orders/page-97ff0cdc04f9a13d.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/dashboard/page-6601f34a71a9891c.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/dashboard/settings/page-e91bfd2c1fbd6b39.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/help-center/page-a67b528c0b8b0f24.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/layout-7957b247cf29c70e.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/maintenance/page-ec6d9c638d8a5f0f.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/make-admin/page-9e309cd5dd59215c.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/order/failed/%5BorderId%5D/page-0ffb1d6baf3c833d.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/order/pending/%5BorderId%5D/page-e4d1aeea78e8facb.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/order/success/%5BorderId%5D/page-2c07d20658c143f6.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/page-f118680e2ef0e305.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/payment/failed/page-263822efb9213faf.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/payment/instructions/page-bb1c656663b8bb96.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/payment/page-92ee5b1722d6399e.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/payment/success/page-5c32ca0d404b4d6c.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/products/%5Bid%5D/page-ca45d1b9b40219ea.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/products/page-92487fef9065e5fb.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/profile/page-af7abceecb57b4a3.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/returns/page-f96bce392a917330.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/shipping-info/page-a4ad8c4f55054498.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/size-guide/page-483817f4a242ff5e.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/app/store-closed/page-07c54a86c2b822ac.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/fd9d1056-0c1ad400f5613285.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/framework-b566207abf043e2e.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/main-a223dc4b6cdf5281.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/main-app-25542f212628ea9f.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/pages/_app-11c09b1e93f7270c.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/pages/_error-b2e2a7e0f328e4ae.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-5a116eb6ac68628f.js",revision:"Q9cP1HcQf-vRIlrOWpUyH"},{url:"/_next/static/css/02061c49db21b60a.css",revision:"02061c49db21b60a"},{url:"/_next/static/media/19cfc7226ec3afaa-s.woff2",revision:"9dda5cfc9a46f256d0e131bb535e46f8"},{url:"/_next/static/media/21350d82a1f187e9-s.woff2",revision:"4e2553027f1d60eff32898367dd4d541"},{url:"/_next/static/media/8e9860b6e62d6359-s.woff2",revision:"01ba6c2a184b8cba08b0d57167664d75"},{url:"/_next/static/media/ba9851c3c22cd980-s.woff2",revision:"9e494903d6b0ffec1a1e14d34427d44d"},{url:"/_next/static/media/c5fe6dc8356a8c31-s.woff2",revision:"027a89e9ab733a145db70f09b8a18b42"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/_next/static/media/e4af272ccee01ff0-s.p.woff2",revision:"65850a373e258f1c897a2b3d75eb74de"},{url:"/apple-touch-icon.png",revision:"b1ea70aaec956dac77b0a8ff31939705"},{url:"/favicon.ico",revision:"a24a210e90880381b8da48f039138a1f"},{url:"/icon-192.png",revision:"d41d8cd98f00b204e9800998ecf8427e"},{url:"/icon-512.png",revision:"d41d8cd98f00b204e9800998ecf8427e"},{url:"/logo-baju.svg",revision:"3b77b075524dd9d6a5f9e06d608f4494"},{url:"/logo.svg",revision:"f72b0ed5eeb71d64c0ec5ae9e4021048"},{url:"/manifest.json",revision:"62a27aa62147e0e25abb5ae087cbd7de"},{url:"/uploads/product-1756896092198.jpg",revision:"e7ddb87792c2628eb82789a5ce22089a"}],{ignoreURLParametersMatching:[]}),c.cleanupOutdatedCaches(),c.registerRoute("/",new c.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:c,response:e,event:s,state:a})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),c.registerRoute(/^https?.*/,new c.NetworkFirst({cacheName:"offlineCache",plugins:[new c.ExpirationPlugin({maxEntries:200})]}),"GET")});
