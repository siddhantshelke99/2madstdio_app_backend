import { Op } from 'sequelize';
import { Course, CourseAttributes, CourseCreationAttributes, CourseMode } from '../models/Course';
import { PaginatedResult } from './base.repository';

export interface CourseFilterOptions {
  mode?: CourseMode;
  isPublished?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class CourseRepository {
  async findAll(options: CourseFilterOptions = {}): Promise<PaginatedResult<Course>> {
    const { mode, isPublished, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (mode) {
      where.mode = mode;
    }

    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { slug: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Course.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'ASC']],
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findPublished(options: Omit<CourseFilterOptions, 'isPublished'> = {}): Promise<PaginatedResult<Course>> {
    return this.findAll({ ...options, isPublished: true });
  }

  async findById(id: string): Promise<Course | null> {
    return Course.findByPk(id);
  }

  async findBySlug(slug: string): Promise<Course | null> {
    return Course.findOne({
      where: { slug },
    });
  }

  async create(data: CourseCreationAttributes): Promise<Course> {
    return Course.create(data);
  }

  async update(id: string, updates: Partial<CourseAttributes>): Promise<Course | null> {
    const course = await Course.findByPk(id);
    if (!course) return null;
    return course.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const rows = await Course.destroy({
      where: { id },
    });
    return rows > 0;
  }
}

export const courseRepository = new CourseRepository();
