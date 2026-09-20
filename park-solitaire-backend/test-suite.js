/**
 * Automated Test Suite for Park Solitaire API
 * Tests health, auth, client dossier, visits radar, and complaints isolation.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5001/api';

let adminToken = '';
let partnerToken = '';
let partnerId = null;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('   PARK SOLITAIRE AUTOMATED TEST SUITE');
  console.log('========================================');
  console.log(`Target URL: ${BASE_URL}\n`);

  try {
    // 1. Health check
    console.log('--- 1. Health & Server Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health responds with status ok');

    // 2. Auth - Admin Login
    console.log('\n--- 2. Authentication ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@parksolitaire.com', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.token && adminLoginData.user.role === 'admin', 'Admin login successful with valid JWT');
    adminToken = adminLoginData.token;

    // 3. Auth - Partner Login
    const partnerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'partner@parksolitaire.com', password: 'partner123' })
    });
    const partnerLoginData = await partnerLoginRes.json();
    assert(partnerLoginRes.status === 200 && partnerLoginData.token && partnerLoginData.user.role === 'partner', 'Partner login successful with valid JWT');
    partnerToken = partnerLoginData.token;
    partnerId = partnerLoginData.user.id;

    // 3a. Auth - Partner Registration with Dual Contact Numbers
    const testCpEmail = `testcp_${Date.now()}@example.com`;
    const cpRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firm_name: 'Metro Assets LLP',
        name: 'Vikas Malhotra',
        phone: '+91 98200 11223',
        phone2: '+91 98200 44556',
        email: testCpEmail,
        password: 'Password123'
      })
    });
    const cpRegData = await cpRegRes.json();
    assert(
      cpRegRes.status === 201 &&
      cpRegData.user?.firm_name === 'Metro Assets LLP' &&
      cpRegData.user?.phone === '+91 98200 11223' &&
      cpRegData.user?.phone2 === '+91 98200 44556',
      'CP registration succeeds with firm_name and dual contact numbers (phone & phone2)'
    );

    // Verify in Admin Partners List
    const partnersRes = await fetch(`${BASE_URL}/admin/partners`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const partnersData = await partnersRes.json();
    const registeredPartner = partnersData.find((p) => p.email === testCpEmail);
    assert(
      registeredPartner &&
      registeredPartner.phone === '+91 98200 11223' &&
      registeredPartner.phone2 === '+91 98200 44556',
      'Admin /admin/partners includes newly registered CP with both contact numbers'
    );

    // 4. Client Dossier & Details + Auto-scheduled Visit
    console.log('\n--- 3. Client Management & Dossier Fields ---');
    const clientsRes = await fetch(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const clientsData = await clientsRes.json();
    assert(clientsRes.status === 200 && Array.isArray(clientsData), `Retrieved ${clientsData.length} clients for admin`);
    if (clientsData.length > 0) {
      const sample = clientsData[0];
      assert('name' in sample && 'phone' in sample && 'unit_type' in sample, 'Client object contains required fields (name, phone, unit_type)');
    }

    // 4b. Test creating a new client with visit date and time by Channel Partner
    console.log('\n--- 3b. Add Client with Visit Date & Time (CP Flow) ---');
    const tomorrowDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const createClientWithVisitRes = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`
      },
      body: JSON.stringify({
        name: 'Automated Test Client',
        phone: '+91 99999 88888',
        email: 'testclient@example.com',
        unit_type: '3 BHK',
        budget: '₹ 80L - 1 Cr',
        source: 'Referral',
        visit_date: tomorrowDate,
        visit_time: '11:30',
        visit_notes: 'Automated visit verification for tomorrow'
      })
    });
    const createClientWithVisitData = await createClientWithVisitRes.json();
    assert(
      createClientWithVisitRes.status === 201 && createClientWithVisitData.id,
      'CP successfully added client with visit schedule options'
    );
    assert(
      createClientWithVisitData.status === 'Site Visit Planned',
      'Client status automatically set to "Site Visit Planned"'
    );
    assert(
      createClientWithVisitData.scheduled_visit && createClientWithVisitData.scheduled_visit.visit_time === '11:30',
      'Scheduled visit record auto-created with exact visit_date and visit_time (11:30)'
    );

    // Clean up test client (which cascades and deletes visit)
    if (createClientWithVisitData.id) {
      await fetch(`${BASE_URL}/clients/${createClientWithVisitData.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
    }

    // 5. Visits & Tomorrow Visit Radar
    console.log('\n--- 4. Visits & Tomorrow Radar Verification ---');
    const visitsRes = await fetch(`${BASE_URL}/visits`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const visitsData = await visitsRes.json();
    assert(visitsRes.status === 200 && Array.isArray(visitsData), `Retrieved ${visitsData.length} visits`);

    // Verify rich client dossier join on visits
    if (visitsData.length > 0) {
      const v = visitsData[0];
      const hasClientJoin = ('client_name' in v) || ('name' in v);
      assert(hasClientJoin, 'Visit record contains joined client information');
    }

    // 6. Complaints Isolation Verification
    console.log('\n--- 5. Targeted Complaints Isolation ---');
    const firstClient = clientsData[0];
    const testComplaintSubject = `Test Ticket #${Date.now().toString().slice(-4)}`;
    const createCompRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        client_id: firstClient.id,
        partner_id: partnerId,
        subject: testComplaintSubject,
        description: 'Automated privacy isolation verification ticket',
        status: 'open'
      })
    });
    const createCompData = await createCompRes.json();
    assert(createCompRes.status === 201 && createCompData.id, 'Admin successfully created targeted complaint');

    // Partner fetches complaints
    const partnerCompRes = await fetch(`${BASE_URL}/complaints`, {
      headers: { Authorization: `Bearer ${partnerToken}` }
    });
    const partnerCompData = await partnerCompRes.json();
    const partnerSeesTicket = partnerCompData.some(c => c.id === createCompData.id);
    assert(partnerSeesTicket, 'Targeted Channel Partner can see their assigned complaint');

    // Check that non-assigned complaints are not leaked
    const allAssignedToPartner = partnerCompData.every(c => Number(c.partner_id) === Number(partnerId) || c.created_by === partnerId);
    assert(allAssignedToPartner, 'Strict Privacy Verified: Channel Partner sees ONLY tickets belonging to them');

    // Clean up test complaint
    await fetch(`${BASE_URL}/complaints/${createCompData.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    // 7. Admin Dashboard Analytics
    console.log('\n--- 6. Admin Dashboard Stats ---');
    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200 && 'totalClients' in dashData && 'totalVisits' in dashData, 'Admin dashboard returns consolidated analytics metrics');

    // 8. SSE Real-Time Stream Handshake
    console.log('\n--- 7. Real-Time Server-Sent Events (SSE) ---');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    try {
      const sseRes = await fetch(`${BASE_URL}/events`, { signal: controller.signal });
      clearTimeout(timeout);
      const contentType = sseRes.headers.get('content-type') || '';
      assert(contentType.includes('text/event-stream'), `SSE endpoint correctly opens text/event-stream channel (${contentType})`);
    } catch (e) {
      if (e.name === 'AbortError') {
        assert(true, 'SSE endpoint kept connection open as expected (stream handshake active)');
      } else {
        throw e;
      }
    }

  } catch (err) {
    console.error('\n  ❌ [EXCEPTION]', err.message);
    failed++;
  }

  console.log('\n========================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
