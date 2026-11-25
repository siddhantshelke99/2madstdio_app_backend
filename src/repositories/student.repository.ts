import { Op } from 'sequelize';
import { Student, Course } from '../models';
import { StudentAttributes, StudentCreationAttributes, StudentStatus } from '../models/Student';
import { PaginatedResult } from './base.repository';

export interface StudentFilterOptions {
  status?: StudentStatus;
  courseId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class StudentRepository {
  async findAll(options: StudentFilterOptions = {}): Promise<PaginatedResult<Student>> {
    const { status, courseId, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Student.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'slug', 'fee', 'duration', 'mode'],
        },
      ],
      limit,
      offset,
      order: [['registered_at', 'DESC']],
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: string): Promise<Student | null> {
    return Student.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
        },
      ],
    });
  }

  async create(data: StudentCreationAttributes): Promise<Student> {
    const student = await Student.create(data);
    return this.findById(student.id) as Promise<Student>;
  }

  async updateStatus(
    id: string,
    status: StudentStatus,
    notes?: string | null
  ): Promise<Student | null> {
    const student = await Student.findByPk(id);
    if (!student) return null;

    const updates: Partial<StudentAttributes> = { status };
    if (notes !== undefined) {
      updates.notes = notes;
    }

    await student.update(updates);
    return this.findById(id);
  }

  async countByStatus(): Promise<Record<StudentStatus, number>> {
    const counts: Record<StudentStatus, number> = {
      new: 0,
      contacted: 0,
      enrolled: 0,
      dropped: 0,
    };

    const results = await Student.findAll({
      attributes: [
        'status',
        [Student.sequelize!.fn('COUNT', Student.sequelize!.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }) as unknown as { status: StudentStatus; count: string | number }[];

    results.forEach((row) => {
      counts[row.status] = parseInt(String(row.count), 10);
    });

    return counts;
  }
}

export const studentRepository = new StudentRepository();
