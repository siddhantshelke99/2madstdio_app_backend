import { Course, Student, Inquiry } from '../models';
import { studentRepository } from './student.repository';
import { inquiryRepository } from './inquiry.repository';

export interface DashboardStats {
  courses: {
    total: number;
    published: number;
  };
  students: {
    total: number;
    byStatus: {
      new: number;
      contacted: number;
      enrolled: number;
      dropped: number;
    };
    totalEnrolledRevenue: number;
  };
  inquiries: {
    total: number;
    byStatus: {
      open: number;
      resolved: number;
    };
    byType: {
      studio_project: number;
      academy_general: number;
    };
  };
  recentStudents: Student[];
  recentInquiries: Inquiry[];
}

export class DashboardRepository {
  async getStats(): Promise<DashboardStats> {
    const [
      totalCourses,
      publishedCourses,
      totalStudents,
      studentsByStatus,
      totalInquiries,
      inquiriesByStatus,
      inquiriesByType,
      recentStudents,
      recentInquiries,
      enrolledStudents,
    ] = await Promise.all([
      Course.count(),
      Course.count({ where: { isPublished: true } }),
      Student.count(),
      studentRepository.countByStatus(),
      Inquiry.count(),
      inquiryRepository.countByStatus(),
      inquiryRepository.countByType(),
      Student.findAll({
        limit: 5,
        order: [['registered_at', 'DESC']],
        include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'slug'] }],
      }),
      Inquiry.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
      }),
      Student.findAll({
        where: { status: 'enrolled' },
        include: [{ model: Course, as: 'course', attributes: ['id', 'fee'] }],
      }),
    ]);

    const totalEnrolledRevenue = enrolledStudents.reduce((acc, curr) => {
      const fee = curr.course?.fee || 0;
      return acc + Number(fee);
    }, 0);

    return {
      courses: {
        total: totalCourses,
        published: publishedCourses,
      },
      students: {
        total: totalStudents,
        byStatus: studentsByStatus,
        totalEnrolledRevenue,
      },
      inquiries: {
        total: totalInquiries,
        byStatus: inquiriesByStatus,
        byType: inquiriesByType,
      },
      recentStudents,
      recentInquiries,
    };
  }
}

export const dashboardRepository = new DashboardRepository();
