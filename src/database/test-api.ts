import { createApp } from '../app';
import { env } from '../config/env';
import { testDbConnection } from '../config/database';
import http from 'http';

const testAllEndpoints = async () => {
  console.log('🧪 Starting API Endpoints Verification Test...');
  await testDbConnection();

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5001, () => resolve());
  });

  const baseUrl = 'http://localhost:5001';
  let adminToken = '';
  let sampleCourseId = '';
  let sampleStudentId = '';
  let sampleInquiryId = '';

  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      process.exit(1);
    } else {
      console.log(`✅ PASS: ${msg}`);
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    assert(healthRes.status === 200, 'GET /api/v1/health returns 200');

    // 2. Public Courses
    const coursesRes = await fetch(`${baseUrl}/api/v1/courses`);
    const coursesData: any = await coursesRes.json();
    assert(coursesRes.status === 200 && coursesData.success === true, 'GET /api/v1/courses returns 200');
    assert(coursesData.data.length > 0, 'Public courses list contains seeded courses');
    sampleCourseId = coursesData.data[0].id;
    const sampleSlug = coursesData.data[0].slug;

    // 3. Public Course by Slug & ID
    const slugRes = await fetch(`${baseUrl}/api/v1/courses/slug/${sampleSlug}`);
    assert(slugRes.status === 200, `GET /api/v1/courses/slug/${sampleSlug} returns 200`);
    const idRes = await fetch(`${baseUrl}/api/v1/courses/${sampleCourseId}`);
    assert(idRes.status === 200, `GET /api/v1/courses/${sampleCourseId} returns 200`);

    // 4. Public Student Registration
    const candidateEmail = `candidate_${Date.now()}@test.com`;
    const regRes = await fetch(`${baseUrl}/api/v1/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Candidate',
        email: candidateEmail,
        phone: '+91 99999 88888',
        whatsappNumber: '+91 99999 88888',
        courseId: sampleCourseId,
        notes: 'Interested in early morning batch',
      }),
    });
    const regData: any = await regRes.json();
    assert(regRes.status === 201 && regData.success === true, 'POST /api/v1/students/register returns 201');
    sampleStudentId = regData.data.id;

    // 5. Public Inquiry Submission
    const inqRes = await fetch(`${baseUrl}/api/v1/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automotive Design Partner',
        email: `partner_${Date.now()}@designoem.com`,
        phone: '+91 98888 77777',
        type: 'studio_project',
        message: 'Looking to contract scale clay styling for 3 commercial vehicles.',
      }),
    });
    const inqData: any = await inqRes.json();
    assert(inqRes.status === 201 && inqData.success === true, 'POST /api/v1/inquiries returns 201');
    sampleInquiryId = inqData.data.id;

    // 6. Admin Login Failure
    const failLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.DEFAULT_ADMIN_EMAIL,
        password: 'WrongPassword!',
      }),
    });
    assert(failLoginRes.status === 401, 'POST /api/v1/auth/login with invalid password returns 401');

    // 7. Admin Login Success
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.DEFAULT_ADMIN_EMAIL,
        password: env.DEFAULT_ADMIN_PASSWORD,
      }),
    });
    const loginData: any = await loginRes.json();
    assert(loginRes.status === 200 && loginData.data?.token, 'POST /api/v1/auth/login succeeds and returns JWT');
    adminToken = loginData.data.token;

    // 8. Auth Me (Protected)
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData: any = await meRes.json();
    assert(meRes.status === 200 && meData.data?.email === env.DEFAULT_ADMIN_EMAIL.toLowerCase(), 'GET /api/v1/auth/me returns admin data');

    // Auth Me Without Token (Should 401)
    const noTokenRes = await fetch(`${baseUrl}/api/v1/auth/me`);
    assert(noTokenRes.status === 401, 'GET /api/v1/auth/me without token returns 401 Unauthorized');

    // 9. Admin Courses CRUD
    // List
    const adminCoursesRes = await fetch(`${baseUrl}/api/v1/admin/courses`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminCoursesRes.status === 200, 'GET /api/v1/admin/courses returns 200');

    // Create course
    const newCourseRes = await fetch(`${baseUrl}/api/v1/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Aerodynamics & Wind Tunnel Testing',
        slug: `aero-wind-tunnel-${Date.now()}`,
        description: 'Advanced testing techniques and aerodynamic surfacing for vehicle development.',
        duration: '6 Weeks',
        fee: 55000,
        mode: 'offline',
        isPublished: true,
        syllabus: [
          { weekOrModule: 'Module 1', topic: 'Boundary layer and drag coefficients' },
          { weekOrModule: 'Module 2', topic: 'Smoke visualization and CFD correlation' },
        ],
      }),
    });
    const newCourseData: any = await newCourseRes.json();
    assert(newCourseRes.status === 201, 'POST /api/v1/admin/courses returns 201');
    const createdCourseId = newCourseData.data.id;

    // Update course
    const updateCourseRes = await fetch(`${baseUrl}/api/v1/admin/courses/${createdCourseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fee: 58000,
        duration: '7 Weeks',
      }),
    });
    assert(updateCourseRes.status === 200, 'PUT /api/v1/admin/courses/:id returns 200');

    // Delete course
    const deleteCourseRes = await fetch(`${baseUrl}/api/v1/admin/courses/${createdCourseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteCourseRes.status === 200, 'DELETE /api/v1/admin/courses/:id returns 200');

    // 10. Admin Students List & Update Status
    const studentsRes = await fetch(`${baseUrl}/api/v1/admin/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(studentsRes.status === 200, 'GET /api/v1/admin/students returns 200');

    const updateStudentRes = await fetch(`${baseUrl}/api/v1/admin/students/${sampleStudentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'enrolled',
        notes: 'Confirmed seat via WhatsApp and verified payment.',
      }),
    });
    const updateStudentData: any = await updateStudentRes.json();
    assert(
      updateStudentRes.status === 200 && updateStudentData.data?.status === 'enrolled',
      'PATCH /api/v1/admin/students/:id/status updates status to enrolled'
    );

    // 11. Admin Inquiries List & Update Status
    const inquiriesRes = await fetch(`${baseUrl}/api/v1/admin/inquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(inquiriesRes.status === 200, 'GET /api/v1/admin/inquiries returns 200');

    const updateInquiryRes = await fetch(`${baseUrl}/api/v1/admin/inquiries/${sampleInquiryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'resolved',
      }),
    });
    const updateInquiryData: any = await updateInquiryRes.json();
    assert(
      updateInquiryRes.status === 200 && updateInquiryData.data?.status === 'resolved',
      'PATCH /api/v1/admin/inquiries/:id/status updates status to resolved'
    );

    // 12. Dashboard Stats
    const statsRes = await fetch(`${baseUrl}/api/v1/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData: any = await statsRes.json();
    assert(statsRes.status === 200 && statsData.success === true, 'GET /api/v1/dashboard/stats returns 200');
    assert(statsData.data.courses.total > 0, 'Dashboard stats report course counts');
    assert(statsData.data.students.total > 0, 'Dashboard stats report student counts');
    assert(statsData.data.inquiries.total > 0, 'Dashboard stats report inquiry counts');
    assert(typeof statsData.data.students.totalEnrolledRevenue === 'number', 'Dashboard stats calculate enrolled revenue');

    const adminStatsRes = await fetch(`${baseUrl}/api/v1/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStatsRes.status === 200, 'GET /api/v1/admin/dashboard/stats returns 200');

    // 13. Automated Workflow Verification (Wait briefly for async student communications)
    await new Promise((r) => setTimeout(r, 150));
    const autoLogsRes = await fetch(`${baseUrl}/api/v1/communications/logs?recipientId=${sampleStudentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const autoLogsData: any = await autoLogsRes.json();
    assert(autoLogsRes.status === 200, 'GET /api/v1/communications/logs for registered student returns 200');
    assert(autoLogsData.data.length >= 2, 'Automated async Email & WhatsApp logs recorded for student registration');

    // 14. Manual Admin Communication: Follow-up Email to Student
    const manualEmailRes = await fetch(`${baseUrl}/api/v1/communications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipientType: 'student',
        recipientId: sampleStudentId,
        channel: 'email',
        subject: 'Invitation to 2NOMADS Studio Tour & Clay Demo',
        message: 'Dear Candidate,\nWe would like to invite you to our studio this Saturday at 11 AM to see live automotive clay sculpting and meet our design leads.\nSee you at the studio!',
      }),
    });
    const manualEmailData: any = await manualEmailRes.json();
    assert(manualEmailRes.status === 200 && manualEmailData.success === true, 'POST /api/v1/communications/send (Email) succeeds');
    assert(manualEmailData.data?.log?.channel === 'email', 'Manual email logged in database');

    // 15. Manual Admin Communication: WhatsApp Message to Student
    const manualWaRes = await fetch(`${baseUrl}/api/v1/communications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipientType: 'student',
        recipientId: sampleStudentId,
        channel: 'whatsapp',
        message: 'Hi! Just sent you an email with your studio tour pass for Saturday. Let us know if you have any questions!',
      }),
    });
    const manualWaData: any = await manualWaRes.json();
    assert(manualWaRes.status === 200 && manualWaData.success === true, 'POST /api/v1/communications/send (WhatsApp) succeeds');
    assert(manualWaData.data?.log?.channel === 'whatsapp', 'Manual WhatsApp logged in database');

    // 16. Manual Admin Communication: Follow-up Email to Inquiry
    const manualInqRes = await fetch(`${baseUrl}/api/v1/communications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipientType: 'inquiry',
        recipientId: sampleInquiryId,
        channel: 'email',
        subject: 'Re: 2NOMADS Studio OEM Design Services Quotation',
        message: 'Hello,\nThank you for reaching out regarding the commercial vehicle styling project.\nOur head of modeling has prepared an initial scope of work and quotation.',
      }),
    });
    const manualInqData: any = await manualInqRes.json();
    assert(manualInqRes.status === 200 && manualInqData.success === true, 'POST /api/v1/communications/send to Inquiry succeeds');

    // 17. Validation failure: Missing subject when channel is email
    const invalidEmailRes = await fetch(`${baseUrl}/api/v1/communications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipientType: 'student',
        recipientId: sampleStudentId,
        channel: 'email',
        message: 'This email is missing a subject line.',
      }),
    });
    assert(invalidEmailRes.status === 400, 'POST /api/v1/communications/send without subject returns 400 Validation Error');

    // 18. Communication Logs List & Channel Filtering
    const allLogsRes = await fetch(`${baseUrl}/api/v1/communications/logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allLogsData: any = await allLogsRes.json();
    assert(allLogsRes.status === 200, 'GET /api/v1/communications/logs returns 200');
    assert(allLogsData.data.length > 0, 'Communications logs list returns records');

    const emailOnlyLogsRes = await fetch(`${baseUrl}/api/v1/communications/logs?channel=email`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const emailOnlyData: any = await emailOnlyLogsRes.json();
    assert(emailOnlyLogsRes.status === 200, 'GET /api/v1/communications/logs?channel=email returns 200');
    assert(emailOnlyData.data.every((l: any) => l.channel === 'email'), 'Filtered logs return only email records');

    const waOnlyLogsRes = await fetch(`${baseUrl}/api/v1/communications/logs?channel=whatsapp`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const waOnlyData: any = await waOnlyLogsRes.json();
    assert(waOnlyLogsRes.status === 200, 'GET /api/v1/communications/logs?channel=whatsapp returns 200');
    assert(waOnlyData.data.every((l: any) => l.channel === 'whatsapp'), 'Filtered logs return only WhatsApp records');

    console.log('\n======================================================');
    console.log('🎉 ALL 18 API & COMMUNICATION TEST SUITES PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
};

testAllEndpoints();
