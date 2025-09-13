const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== VAPID Keys Generated ===\n');
console.log('Add these to your .env file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n=== Important Notes ===');
console.log('- Public key: Used by client-side JavaScript (safe to expose)');
console.log('- Private key: Used by server-side only (keep secret!)');
console.log('- These keys identify your app to push services');
console.log('- Never share the private key publicly');
