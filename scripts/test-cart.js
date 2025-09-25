// Test script to add items to cart for debugging
// Run this in browser console to test cart functionality

// Test cart items
const testItems = [
  {
    id: 'test-1',
    name: 'Vintage T-Shirt',
    price: 55000,
    imageUrl: '/api/placeholder/150/150',
    size: 'M',
    stock: 5
  },
  {
    id: 'test-2', 
    name: 'Denim Jacket',
    price: 125000,
    imageUrl: '/api/placeholder/150/150',
    size: 'L',
    stock: 3
  }
];

// Function to add test items to cart
function addTestItemsToCart() {
  // Get cart store
  const cartStore = window.__CART_STORE__ || useCart?.getState?.();
  
  if (!cartStore) {
    console.error('Cart store not found');
    return;
  }

  // Add test items
  testItems.forEach(item => {
    cartStore.addItem(item);
    console.log('Added item to cart:', item.name);
  });

  console.log('Test items added to cart');
  console.log('Total items:', cartStore.getTotalItems());
}

// Function to clear cart
function clearTestCart() {
  const cartStore = window.__CART_STORE__ || useCart?.getState?.();
  
  if (!cartStore) {
    console.error('Cart store not found');
    return;
  }

  cartStore.clearCart();
  console.log('Cart cleared');
}

// Export functions to window for easy access
window.addTestItemsToCart = addTestItemsToCart;
window.clearTestCart = clearTestCart;

console.log('Cart test functions loaded. Use:');
console.log('- addTestItemsToCart() to add test items');
console.log('- clearTestCart() to clear cart');
