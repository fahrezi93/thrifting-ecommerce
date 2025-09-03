// Test admin dashboard endpoint directly
const fetch = require('node-fetch');

async function testAdminEndpoint() {
  try {
    console.log('Testing admin dashboard endpoint...');
    
    const response = await fetch('http://localhost:3000/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjNmYmIxNzA2ZGY4NmI5NGZjNGZkZjQwNzk4NmY4MjQwNzQ5NzE0YjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdGhyaWZ0aW5nLWVjb21tZXJjZSIsImF1ZCI6InRocmlmdGluZy1lY29tbWVyY2UiLCJhdXRoX3RpbWUiOjE3MjU0NTQ4NzUsInVzZXJfaWQiOiIzblpmN0JSa0tDTTZSMnQ5SlQ1czhhdU1kTGIyIiwic3ViIjoiM25KZjdCUmtLQ002UjJ0OUpUNXM4YW1NZExiMiIsImlhdCI6MTcyNTQ1NDg3NSwiZXhwIjoxNzI1NDU4NDc1LCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJhZG1pbkBhZG1pbi5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.test'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.status === 500) {
      console.log('Server returned 500 error');
    }
    
  } catch (error) {
    console.error('Error testing endpoint:', error);
  }
}

testAdminEndpoint();
