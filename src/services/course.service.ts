import { courseRepository, CourseFilterOptions } from '../repositories/course.repository';
import { Course } from '../models/Course';
import { PaginatedResult } from '../repositories/base.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import { CreateCourseInput, UpdateCourseInput } from '../validations/course.validation';

export class CourseService {
  async getPublishedCourses(options: CourseFilterOptions = {}): Promise<PaginatedResult<Course>> {
    return courseRepository.findPublished(options);
  }

  async getAllCourses(options: CourseFilterOptions = {}): Promise<PaginatedResult<Course>> {
    return courseRepository.findAll(options);
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError(`Course with ID "${id}" was not found`);
    }
    return course;
  }

  async getCourseBySlug(slug: string): Promise<Course> {
    const course = await courseRepository.findBySlug(slug);
    if (!course) {
      throw new NotFoundError(`Course with slug "${slug}" was not found`);
    }
    return course;
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const existing = await courseRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError(`Course with slug "${input.slug}" already exists`);
    }

    return courseRepository.create(input);
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError(`Course with ID "${id}" was not found`);
    }

    if (input.slug && input.slug !== course.slug) {
      const existing = await courseRepository.findBySlug(input.slug);
      if (existing) {
        throw new ConflictError(`Course with slug "${input.slug}" already exists`);
      }
    }

    const updated = await courseRepository.update(id, input);
    return updated!;
  }

  async deleteCourse(id: string): Promise<void> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError(`Course with ID "${id}" was not found`);
    }

    await courseRepository.delete(id);
  }
}

export const courseService = new CourseService();
