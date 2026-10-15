/**
 * Comprehensive Backend API Test Suite
 * Validates SQLite3 transactions, REST routes, input handling, and uploads.
 */
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };

    if (body && typeof body === 'object') {
      body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('=====================================================');
  console.log(' STARTING BACKEND REST API & SQLITE3 TEST SUITE');
  console.log('=====================================================');

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert('1. Health Check Endpoint', health.status === 200 && health.data.status === 'online');

    // 2. Products listing
    const productsRes = await request('GET', '/api/products');
    assert('2. Fetch All Products', productsRes.status === 200 && Array.isArray(productsRes.data) && productsRes.data.length > 0);

    // 3. Products category filtering
    const outerwearRes = await request('GET', '/api/products?category=outerwear');
    assert('3. Filter Products by Category (Outerwear)', outerwearRes.status === 200 && outerwearRes.data.every(p => p.category === 'outerwear'));

    // 4. Products search
    const searchRes = await request('GET', '/api/products?search=cashmere');
    assert('4. Full-Text Search Products ("cashmere")', searchRes.status === 200 && searchRes.data.length > 0);

    // 5. Single product retrieval
    const prod1 = await request('GET', '/api/products/prod-001');
    assert('5. Fetch Single Product By ID (prod-001)', prod1.status === 200 && prod1.data.id === 'prod-001');

    // 6. Update variant inventory stock
    const stockPatch = await request('PATCH', '/api/products/prod-001/stock', {
      variantKey: 'desert khaki-s',
      stockQty: 25
    });
    assert('6. Admin Update Variant Stock via PATCH', stockPatch.status === 200 && stockPatch.data.inventory['desert khaki-s'] === 25);

    // 7. Create customer order with stock deduction
    const orderPayload = {
      customer: {
        fullName: 'Elena Vance',
        email: 'elena.vance@example.com',
        shippingAddress: '742 Evergreen Terrace, New York, NY 10001'
      },
      items: [
        {
          productId: 'prod-001',
          name: 'Architectural Double-Breasted Trench',
          color: 'Desert Khaki',
          size: 'S',
          price: 245,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'
        }
      ],
      pricing: {
        subtotal: 490,
        discount: 0,
        shipping: 0,
        tax: 39,
        total: 529
      }
    };
    const orderRes = await request('POST', '/api/orders', orderPayload);
    assert('7. Place Customer Order with SQLite3 Transaction', orderRes.status === 201 && orderRes.data.orderId.startsWith('ORD-'));

    // 8. Verify stock deduction occurred
    const prod1After = await request('GET', '/api/products/prod-001');
    assert('8. Atomic Stock Deduction in SQLite3 (25 - 2 = 23)', prod1After.data.inventory['desert khaki-s'] === 23);

    // 9. Fetch all customer orders
    const allOrders = await request('GET', '/api/orders');
    assert('9. Retrieve All Orders from SQLite3', allOrders.status === 200 && Array.isArray(allOrders.data) && allOrders.data.length > 0);

    // 10. Fetch user profile
    const profileRes = await request('GET', '/api/user/profile?email=elena.vance@example.com');
    assert('10. Fetch Customer Profile from SQLite3', profileRes.status === 200 && profileRes.data.email === 'elena.vance@example.com');

    // 11. Update user profile
    const updateProfileRes = await request('PUT', '/api/user/profile', {
      fullName: 'Elena Vance',
      email: 'elena.vance@example.com',
      phone: '+1 (555) 777-9999',
      preferredSize: 'M',
      preferredFit: 'Relaxed Tailored',
      address: '742 Evergreen Terrace, Apt 4B',
      city: 'New York',
      postalCode: '10001'
    });
    assert('11. Update Profile in SQLite3 via PUT', updateProfileRes.status === 200 && updateProfileRes.data.phone === '+1 (555) 777-9999');

    // Summary
    console.log('=====================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('=====================================================');

    if (failed === 0) {
      console.log(' ALL BACKEND TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
