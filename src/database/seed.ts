import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { Admin } from '../models/Admin';
import { Course } from '../models/Course';
import { Student } from '../models/Student';
import { Inquiry } from '../models/Inquiry';
import { CommunicationLog } from '../models/CommunicationLog';
import { env } from '../config/env';

export const runSeed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await sequelize.authenticate();

    // 1. Seed Super Admin
    const existingAdmin = await Admin.findOne({
      where: { email: env.DEFAULT_ADMIN_EMAIL.toLowerCase() },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(env.DEFAULT_ADMIN_PASSWORD, 10);
      await Admin.create({
        name: env.DEFAULT_ADMIN_NAME,
        email: env.DEFAULT_ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: 'super_admin',
        isActive: true,
      });
      console.log(`✅ Super Admin created: ${env.DEFAULT_ADMIN_EMAIL}`);
    } else {
      console.log(`ℹ️ Super Admin already exists: ${env.DEFAULT_ADMIN_EMAIL}`);
    }

    // 2. Seed Courses (Derived from 2NOMADS Design Studio & Academy reference site)
    const sampleCourses = [
      {
        title: 'Transportation Design',
        slug: 'transportation-design',
        description:
          'Learn how a vehicle is born — from research and concept thinking to sketching, proportion, and virtual rendering. Work on real design briefs the way a professional automotive studio operates.',
        duration: '12 Weeks',
        fee: 65000,
        mode: 'hybrid' as const,
        isPublished: true,
        syllabus: [
          {
            weekOrModule: 'Module 01',
            topic: 'Design Research & Vehicle Architecture',
            details: [
              'Ergonomics & packaging principles',
              'Market benchmarking & vehicle DNA',
              'Ideation thumbnailing',
            ],
          },
          {
            weekOrModule: 'Module 02',
            topic: 'Automotive Sketching & Perspective',
            details: [
              'Dynamic proportions & side profiles',
              'Speed forms & acceleration curves',
              'Focal length rendering',
            ],
          },
          {
            weekOrModule: 'Module 03',
            topic: 'Form Language & Digital Rendering',
            details: [
              'Photoshop rendering workflows',
              'Light reflection & shader maps',
              'Volume indication & surfacing lines',
            ],
          },
          {
            weekOrModule: 'Module 04',
            topic: 'Studio Presentation & Portfolio Review',
            details: [
              'Compiling full OEM-grade concept decks',
              'Industry critique and presentation polish',
            ],
          },
        ],
      },
      {
        title: 'Clay Modelling',
        slug: 'clay-modelling',
        description:
          'The tactile craft at the heart of automotive styling. Learn studio tools, armature construction, surfacing, and highlight reading — mentored by experienced automotive clay modellers.',
        duration: '8 Weeks',
        fee: 75000,
        mode: 'offline' as const,
        isPublished: true,
        syllabus: [
          {
            weekOrModule: 'Module 01',
            topic: 'Studio Tools & Armature Setup',
            details: [
              'Armature construction and foam core shaping',
              'Bridge setup and coordinate grid layout',
              'Styling clay heating and application',
            ],
          },
          {
            weekOrModule: 'Module 02',
            topic: 'Roughing & Volume Sculpting',
            details: [
              'Bulk material removal with rakes and graters',
              'Establishing primary silhouette and stance',
            ],
          },
          {
            weekOrModule: 'Module 03',
            topic: 'Precision Surfacing & Tape Line Tuning',
            details: [
              'Surface smoothing with spring steel scrapers',
              'Dynamic character lines and tape layout',
              'Crown refinement and transition fillets',
            ],
          },
          {
            weekOrModule: 'Module 04',
            topic: 'Highlight Inspection & Di-Noc Wrapping',
            details: [
              'Neon light reflection checking',
              'Metallic Di-Noc film application for OEM sign-off',
            ],
          },
        ],
      },
      {
        title: 'Digital Sculpting',
        slug: 'digital-sculpting',
        description:
          'Sculpt form on screen with the tactile eye of clay. Build, refine, and visualize automotive designs digitally, ready for 5-axis milling, 3D printing, or VR executive reviews.',
        duration: '10 Weeks',
        fee: 60000,
        mode: 'hybrid' as const,
        isPublished: true,
        syllabus: [
          {
            weekOrModule: 'Module 01',
            topic: 'NURBS Foundations & Curve Network',
            details: [
              'G0, G1, G2, G3 surface continuity theory',
              'SubD vs Class-A modeling philosophies',
            ],
          },
          {
            weekOrModule: 'Module 02',
            topic: 'Automotive Exterior Surfacing',
            details: [
              'Hood, shoulder line, and bumper transitions',
              'Flange and shut-line creation',
            ],
          },
          {
            weekOrModule: 'Module 03',
            topic: 'Design Refinement & Mill Data Preparation',
            details: [
              'Surface diagnostic combs and curvature evaluation',
              'Exporting clean STEP/IGES data for CNC toolpaths',
            ],
          },
          {
            weekOrModule: 'Module 04',
            topic: 'Photorealistic Studio Visualization',
            details: [
              'KeyShot and Blender automotive studio setups',
              'Paint flake, clearcoat, and HDR environment tuning',
            ],
          },
        ],
      },
      {
        title: '3D Scanning & Reverse Engineering',
        slug: 'scanning',
        description:
          'Bridge physical sculpture and digital CAD. Capture physical clay models and parts in high-resolution 3D, process point clouds, clean meshes, and return directly to the vehicle development loop.',
        duration: '4 Weeks',
        fee: 45000,
        mode: 'offline' as const,
        isPublished: true,
        syllabus: [
          {
            weekOrModule: 'Module 01',
            topic: 'Optical & Laser Scanner Setup',
            details: [
              'Marker targets calibration and studio positioning',
              'Laser line exposure for dark and reflective surfaces',
            ],
          },
          {
            weekOrModule: 'Module 02',
            topic: 'Point Cloud & Mesh Clean-up',
            details: [
              'Aligning multi-pass scans and registration',
              'Mesh decimation, hole filling, and feature extraction',
            ],
          },
          {
            weekOrModule: 'Module 03',
            topic: 'Scan-to-CAD Reverse Engineering',
            details: [
              'Cross-section slicing and parametric curve fitting',
              'Deviation color map analysis against styling targets',
            ],
          },
        ],
      },
      {
        title: 'Prototype — Show & Working',
        slug: 'prototype',
        description:
          'Witness how automotive concepts turn into tangible reality. Learn hard modeling, tooling, FRP/carbon fiber layup, and component packaging for functional show and running vehicles.',
        duration: '12 Weeks',
        fee: 85000,
        mode: 'offline' as const,
        isPublished: true,
        syllabus: [
          {
            weekOrModule: 'Module 01',
            topic: 'Tooling & Pattern Making',
            details: [
              'Polyurethane tooling board CNC milling and hand finish',
              'Negative mold fabrication and release systems',
            ],
          },
          {
            weekOrModule: 'Module 02',
            topic: 'FRP & Advanced Composite Layup',
            details: [
              'Fiberglass hand-layup and vacuum bagging techniques',
              'Trimming, reinforcement ribs, and mounting bosses',
            ],
          },
          {
            weekOrModule: 'Module 03',
            topic: 'Chassis & Powertrain Integration',
            details: [
              'EV powertrain, battery box, and harness routing',
              'Suspension clearances and functional ergonomics',
            ],
          },
          {
            weekOrModule: 'Module 04',
            topic: 'Automotive Paint Finishing & Show Assembly',
            details: [
              'Primer surfacing, 3-stage pearl paint, and clear coat',
              'Headlight lens casting and show car final assembly',
            ],
          },
        ],
      },
      {
        title: 'Master Classes Season 01: Concept to Prototype',
        slug: 'masterclasses-season-01',
        description:
          'Comprehensive intensive flagship masterclass: take a real two-wheeler (the Oneaxi Scooter) from initial concept to physical running prototype, mentored directly by industry designers from 2NOMADS and Classic Legend.',
        duration: '16 Weeks',
        fee: 120000,
        mode: 'hybrid' as const,
        isPublished: true,
        syllabus: [
          {
            weekOrModule: 'Phase 01 (Weeks 1-4)',
            topic: 'Vehicle Concept & Sketch Packaging',
            details: [
              'Real client brief breakdown: The Oneaxi EV Scooter',
              'Ideation, package architecture, and design selection',
            ],
          },
          {
            weekOrModule: 'Phase 02 (Weeks 5-8)',
            topic: 'Clay Modeling & Full-Scale Proportions',
            details: [
              'Building the 1:1 scale clay model on actual test chassis',
              'Surfacing, styling line lock-in, and tape review',
            ],
          },
          {
            weekOrModule: 'Phase 03 (Weeks 9-12)',
            topic: '3D Optical Scanning & Class-A Surfacing',
            details: [
              'Full vehicle laser scan, mesh alignment, and reverse CAD',
              'Class-A surface release for production molding',
            ],
          },
          {
            weekOrModule: 'Phase 04 (Weeks 13-16)',
            topic: 'Prototype Assembly & Running Validation',
            details: [
              'FRP body panel production, automotive paint, EV integration',
              'Final working prototype reveal and industry jury demonstration',
            ],
          },
        ],
      },
    ];

    const createdCourses: Course[] = [];

    for (const courseData of sampleCourses) {
      const [course, created] = await Course.findOrCreate({
        where: { slug: courseData.slug },
        defaults: courseData,
      });
      createdCourses.push(course);
      if (created) {
        console.log(`✅ Seeded Course: ${course.title} (${course.slug})`);
      } else {
        console.log(`ℹ️ Course already exists: ${course.title}`);
      }
    }

    // 3. Seed Sample Inquiries (Studio & Academy)
    const sampleInquiries = [
      {
        name: 'Aditya Deshmukh',
        email: 'aditya.deshmukh@classiclegend.in',
        phone: '+91 98230 11223',
        type: 'studio_project' as const,
        message:
          'We need an OEM-grade 1:1 scale styling clay model for an upcoming electric motorcycle concept. Project timeline is 6 weeks starting next month in Pune.',
        status: 'open' as const,
      },
      {
        name: 'Pooja Kulkarni',
        email: 'pooja.k@autodesign.org',
        phone: '+91 97654 33445',
        type: 'academy_general' as const,
        message:
          'Interested in the evening batch for the Clay Modelling course. Do we need prior experience with automotive clay or is it beginner-friendly?',
        status: 'resolved' as const,
      },
      {
        name: 'Rohan Mehra',
        email: 'rohan.mehra@plutomobility.com',
        phone: '+91 99887 76655',
        type: 'studio_project' as const,
        message:
          'Requesting quotation for reverse engineering and 3D optical scanning of three custom scooter body fairings.',
        status: 'open' as const,
      },
    ];

    for (const inqData of sampleInquiries) {
      const existing = await Inquiry.findOne({ where: { email: inqData.email } });
      if (!existing) {
        const inq = await Inquiry.create(inqData);
        await CommunicationLog.create({
          recipientType: 'inquiry',
          recipientId: inq.id,
          channel: 'email',
          templateName: 'inquiry_received_ack',
          payload: { clientName: inq.name, inquiryType: inq.type },
          status: 'sent',
        });
        console.log(`✅ Seeded Inquiry from ${inq.name} (${inq.type})`);
      }
    }

    // 4. Seed Sample Students
    if (createdCourses.length > 0) {
      const sampleStudents = [
        {
          fullName: 'Arjun Verma',
          email: 'arjun.verma@gmail.com',
          phone: '+91 98112 34567',
          whatsappNumber: '+91 98112 34567',
          courseId: createdCourses[0].id, // Transportation Design
          status: 'enrolled' as const,
          notes: 'Enrolled in Season 01 evening batch. Fee paid in full.',
          registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          fullName: 'Sneha Patel',
          email: 'sneha.patel@outlook.com',
          phone: '+91 98223 45678',
          whatsappNumber: '+91 98223 45678',
          courseId: createdCourses[1].id, // Clay Modelling
          status: 'contacted' as const,
          notes: 'Called on phone; invited to studio for live clay demo on Saturday.',
          registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          fullName: 'Vikram Joshi',
          email: 'vikram.j@gmail.com',
          phone: '+91 98334 56789',
          whatsappNumber: '+91 98334 56789',
          courseId: createdCourses[5].id, // Master Classes Season 01
          status: 'enrolled' as const,
          notes: 'Automotive engineering final year student at MIT Pune.',
          registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          fullName: 'Tanvi Shinde',
          email: 'tanvi.shinde@gmail.com',
          phone: '+91 98445 67890',
          whatsappNumber: null,
          courseId: createdCourses[2].id, // Digital Sculpting
          status: 'new' as const,
          notes: 'Applied via website registration form.',
          registeredAt: new Date(),
        },
      ];

      for (const studData of sampleStudents) {
        const existing = await Student.findOne({ where: { email: studData.email } });
        if (!existing) {
          const stud = await Student.create(studData);
          await CommunicationLog.create({
            recipientType: 'student',
            recipientId: stud.id,
            channel: stud.whatsappNumber ? 'whatsapp' : 'email',
            templateName: 'student_registration_ack',
            payload: { studentName: stud.fullName, courseId: stud.courseId },
            status: 'sent',
          });
          console.log(`✅ Seeded Student: ${stud.fullName} (${stud.status})`);
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  runSeed();
}
