// Simple Admin Setup - Copy and paste this in browser console
// Make sure you're logged in first

(async function() {
  try {
    // Import Firebase
    const { auth } = await import('./src/lib/firebase.js');
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ Please login first');
      return;
    }
    
    const token = await user.getIdToken(true);
    const response = await fetch('/api/auth/make-admin', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      console.log('✅ Admin access granted! Refreshing...');
      setTimeout(() => location.reload(), 1000);
    } else {
      console.log('❌ Failed. Check if user exists in database.');
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
})();
