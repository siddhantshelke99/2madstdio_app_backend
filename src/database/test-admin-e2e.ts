import { createApp } from '../app';
import { testDbConnection } from '../config/database';
import http from 'http';

async function runAdminE2ETest() {
  console.log('🚀 Running Comprehensive Admin Portal End-to-End Test Suite...\n');

  await testDbConnection();
  console.log('✅ PostgreSQL connection verified.');

  const app = createApp();
  const testPort = 5052;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(testPort, () => resolve());
  });

  const baseUrl = `http://localhost:${testPort}/api/v1`;

  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      server.close();
      process.exit(1);
    } else {
      console.log(`   ✅ PASS: ${msg}`);
    }
  };

  try {
    // 1. Public Visitor: Fetch Courses
    console.log('\n[Step 1] Public: Browsing academy courses...');
    const coursesRes = await fetch(`${baseUrl}/courses`);
    const coursesJson: any = await coursesRes.json();
    assert(coursesRes.status === 200 && coursesJson.success === true, 'Public courses fetched successfully');
    const courses = coursesJson.data;
    assert(courses && courses.length > 0, 'Published courses available for registration');
    const targetCourse = courses[0];
    console.log(`   Target Course Selected: "${targetCourse.title}" (${targetCourse.id})`);

    // 2. Public Visitor: Register for Course
    console.log('\n[Step 2] Public: Registering new student...');
    const studentPayload = {
      fullName: 'Aarav Deshmukh',
      email: `aarav_${Date.now()}@gmail.com`,
      phone: '+91 98230 12345',
      whatsappNumber: '+91 98230 12345',
      courseId: targetCourse.id,
      notes: 'Interested in exterior sketching and clay modeling workshops.',
    };

    const registerRes = await fetch(`${baseUrl}/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentPayload),
    });
    const registerJson: any = await registerRes.json();
    assert(registerRes.status === 201 && registerJson.success === true, 'Student registered successfully');
    const registeredStudent = registerJson.data;
    console.log(`   Student Registered: ${registeredStudent.fullName} (ID: ${registeredStudent.id})`);
    assert(registeredStudent.status === 'new', 'Initial student status is "new"');

    // 3. Public Visitor: Submit Studio Project Inquiry
    console.log('\n[Step 3] Public: Submitting studio project inquiry...');
    const inquiryPayload = {
      name: 'Dr. Nikhil Rao (EV Mobility Startup)',
      email: `nikhil_${Date.now()}@evpulse.io`,
      phone: '+91 98450 67890',
      type: 'studio_project',
      message: 'Looking for exterior styling concept design for a 2-wheeler electric cruiser prototype.',
    };

    const inqRes = await fetch(`${baseUrl}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryPayload),
    });
    const inqJson: any = await inqRes.json();
    assert(inqRes.status === 201 && inqJson.success === true, 'Studio inquiry submitted successfully');
    const registeredInquiry = inqJson.data;
    console.log(`   Inquiry Received: From ${registeredInquiry.name} (ID: ${registeredInquiry.id})`);

    // Give a brief delay for asynchronous communications to log
    await new Promise((r) => setTimeout(r, 200));

    // 4. Admin: Login
    console.log('\n[Step 4] Admin: Logging into Admin Portal...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@2nomads.design',
        password: 'AdminPassword123!',
      }),
    });
    const loginJson: any = await loginRes.json();
    assert(loginRes.status === 200 && loginJson.success === true, 'Admin login succeeded');
    const adminToken = loginJson.data.token;
    const adminUser = loginJson.data.admin;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };
    console.log(`   Admin Authenticated: ${adminUser.name} (${adminUser.email})`);

    // 5. Admin: Dashboard KPI Stats
    console.log('\n[Step 5] Admin: Fetching Dashboard KPI Metrics...');
    const statsRes = await fetch(`${baseUrl}/dashboard/stats`, { headers: authHeaders });
    const statsJson: any = await statsRes.json();
    assert(statsRes.status === 200 && statsJson.success === true, 'Dashboard KPI stats fetched');
    const stats = statsJson.data;
    console.log(`   Total Courses: ${stats.courses.total} (Published: ${stats.courses.published})`);
    console.log(`   Total Students: ${stats.students.total}`);
    console.log(`   Total Inquiries: ${stats.inquiries.total} (Open: ${stats.inquiries.byStatus.open})`);
    console.log(`   Enrolled Revenue: ₹${stats.students.totalEnrolledRevenue.toLocaleString('en-IN')}`);

    // 6. Admin: Create Course
    console.log('\n[Step 6] Admin: Creating a new masterclass course...');
    const newCoursePayload = {
      title: 'Automotive Clay & Digital Sculpting Masterclass',
      slug: `clay-sculpting-masterclass-${Date.now()}`,
      description: 'Hands-on intensive masterclass in 1:4 scale clay modeling and Alias surface refinement.',
      duration: '4 Weeks',
      fee: 45000,
      mode: 'offline',
      syllabus: [
        { weekOrModule: 'Week 1', topic: 'Clay Armature Setup and Milling Fundamentals' },
        { weekOrModule: 'Week 2', topic: 'Surface Roughing, Sweeps, and Bridge Cutters' },
        { weekOrModule: 'Week 3', topic: 'Feature Line Definition & Di-Noc Foil Application' },
        { weekOrModule: 'Week 4', topic: 'Photometric Studio Photography and CAD Validation' },
      ],
      isPublished: true,
    };

    const createCourseRes = await fetch(`${baseUrl}/admin/courses`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newCoursePayload),
    });
    const createCourseJson: any = await createCourseRes.json();
    assert(createCourseRes.status === 201 && createCourseJson.success === true, 'Course created successfully');
    const createdCourse = createCourseJson.data;
    console.log(`   Course Created: "${createdCourse.title}" (ID: ${createdCourse.id})`);

    // 7. Admin: Update Course
    console.log('\n[Step 7] Admin: Updating course details...');
    const updateCourseRes = await fetch(`${baseUrl}/admin/courses/${createdCourse.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        fee: 48000,
        description: 'Hands-on intensive masterclass in 1:4 scale physical clay modeling and Alias digital surfacing.',
      }),
    });
    const updateCourseJson: any = await updateCourseRes.json();
    assert(updateCourseRes.status === 200 && updateCourseJson.data.fee === 48000, 'Course fee updated to ₹48,000');

    // 8. Admin: List Students & Update Student Status & Notes
    console.log('\n[Step 8] Admin: Searching and updating registered student status...');
    const studentsRes = await fetch(`${baseUrl}/admin/students?search=${encodeURIComponent('Aarav')}`, {
      headers: authHeaders,
    });
    const studentsJson: any = await studentsRes.json();
    assert(studentsRes.status === 200, 'Admin students list retrieved');
    const foundStudents = studentsJson.data;
    const targetStudent = foundStudents.find((s: any) => s.id === registeredStudent.id);
    assert(!!targetStudent, 'Registered student found in admin students table');
    console.log(`   Found Student: ${targetStudent.fullName} | Status: ${targetStudent.status}`);

    const updateStatusRes = await fetch(`${baseUrl}/admin/students/${targetStudent.id}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'contacted',
        notes: 'Interview scheduled for Saturday 11:00 AM at Bhosari Studio. Portfolio reviewed.',
      }),
    });
    const updateStatusJson: any = await updateStatusRes.json();
    assert(updateStatusRes.status === 200 && updateStatusJson.data.status === 'contacted', 'Student status updated to "contacted"');
    console.log(`   Internal Notes Saved: "${updateStatusJson.data.notes}"`);

    // 9. Admin: Send Follow-Up Email & WhatsApp via Communications API
    console.log('\n[Step 9] Admin: Dispatching manual follow-up communication to student...');
    const emailDispatchRes = await fetch(`${baseUrl}/communications/send`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        recipientType: 'student',
        recipientId: targetStudent.id,
        channel: 'email',
        subject: 'Your 2NOMADS Studio Interview & Portfolio Review Schedule',
        message: 'Dear Aarav, we are excited to invite you to our studio this Saturday at 11:00 AM for your mentor discussion.',
      }),
    });
    const emailDispatchJson: any = await emailDispatchRes.json();
    assert(emailDispatchRes.status === 200 && emailDispatchJson.success === true, 'Direct follow-up email dispatched to student');

    const waDispatchRes = await fetch(`${baseUrl}/communications/send`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        recipientType: 'student',
        recipientId: targetStudent.id,
        channel: 'whatsapp',
        message: 'Hi Aarav, our lead mentor has confirmed your studio slot for Saturday 11 AM at Bhosari Studio! Check your email for details.',
      }),
    });
    const waDispatchJson: any = await waDispatchRes.json();
    assert(waDispatchRes.status === 200 && waDispatchJson.success === true, 'Direct WhatsApp dispatched to student');

    // 10. Admin: Inquiries Management & Quick Reply
    console.log('\n[Step 10] Admin: Managing inquiries and sending reply...');
    const inqListRes = await fetch(`${baseUrl}/admin/inquiries?status=open`, { headers: authHeaders });
    const inqListJson: any = await inqListRes.json();
    assert(inqListRes.status === 200, 'Admin inquiries list retrieved');
    const openInquiries = inqListJson.data;
    const targetInq = openInquiries.find((i: any) => i.id === registeredInquiry.id);
    assert(!!targetInq, 'Submitted inquiry found in open inquiries table');
    console.log(`   Found open inquiry from: ${targetInq.name}`);

    // Reply to inquiry
    const inqReplyRes = await fetch(`${baseUrl}/communications/send`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        recipientType: 'inquiry',
        recipientId: targetInq.id,
        channel: 'email',
        subject: '2NOMADS Studio — Project Discussion & Scope NDA',
        message: 'Hello Dr. Rao, our studio directors have reviewed your EV cruiser proposal and would love to schedule a preliminary discovery call.',
      }),
    });
    const inqReplyJson: any = await inqReplyRes.json();
    assert(inqReplyRes.status === 200 && inqReplyJson.success === true, 'Reply email sent to studio inquiry');

    // Mark inquiry resolved
    const inqStatusRes = await fetch(`${baseUrl}/admin/inquiries/${targetInq.id}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'resolved' }),
    });
    const inqStatusJson: any = await inqStatusRes.json();
    assert(inqStatusRes.status === 200 && inqStatusJson.data.status === 'resolved', 'Inquiry status marked as "resolved"');

    // 11. Admin: Communication Audit Logs
    console.log('\n[Step 11] Admin: Verifying complete communication audit trail...');
    const logsRes = await fetch(`${baseUrl}/communications/logs?recipientId=${targetStudent.id}`, {
      headers: authHeaders,
    });
    const logsJson: any = await logsRes.json();
    assert(logsRes.status === 200, 'Communication audit logs retrieved');
    const studentLogs = logsJson.data;
    assert(studentLogs && studentLogs.length >= 4, 'Audit logs contain both automated registration alerts + manual follow-ups');
    console.log(`   Audit logs recorded for student ${targetStudent.fullName}: ${studentLogs.length}`);
    for (const log of studentLogs) {
      console.log(`     - [${log.channel.toUpperCase()}] ${log.templateName} -> ${log.status} at ${log.sentAt}`);
    }

    // 12. Cleanup created test course
    console.log('\n[Step 12] Clean up test masterclass course...');
    const delRes = await fetch(`${baseUrl}/admin/courses/${createdCourse.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delRes.status === 200, 'Test course deleted cleanly');

    console.log('\n======================================================');
    console.log('🎉 COMPLETE END-TO-END ADMIN WORKFLOW VERIFIED SUCCESSFULLY!');
    console.log('======================================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E Test Suite Failed:', err);
    server.close();
    process.exit(1);
  }
}

runAdminE2ETest();
