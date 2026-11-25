import { studentRepository, StudentFilterOptions } from '../repositories/student.repository';
import { courseRepository } from '../repositories/course.repository';
import { communicationService } from './communication.service';
import { communicationLogRepository } from '../repositories/communication-log.repository';
import { Student } from '../models/Student';
import { PaginatedResult } from '../repositories/base.repository';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { RegisterStudentInput, UpdateStudentStatusInput } from '../validations/student.validation';

export class StudentService {
  async registerStudent(input: RegisterStudentInput): Promise<Student> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.courseId);
    let course = isUuid ? await courseRepository.findById(input.courseId) : null;
    if (!course) {
      course = await courseRepository.findBySlug(input.courseId);
    }

    if (!course) {
      throw new NotFoundError(`Course "${input.courseId}" was not found`);
    }

    if (!course.isPublished) {
      throw new BadRequestError('Cannot register for an unpublished or inactive course');
    }

    // Consolidate extended application profile details into notes
    const profileDetails: string[] = [];
    if (input.occupation) profileDetails.push(`Occupation: ${input.occupation}`);
    if (input.collegeName) profileDetails.push(`College: ${input.collegeName}`);
    if (input.degreeBranch) profileDetails.push(`Degree: ${input.degreeBranch}`);
    if (input.yearOfStudy) profileDetails.push(`Year: ${input.yearOfStudy}`);
    if (input.companyName) profileDetails.push(`Company: ${input.companyName}`);
    if (input.jobTitle) profileDetails.push(`Role: ${input.jobTitle}`);
    if (input.yearsExperience) profileDetails.push(`Experience: ${input.yearsExperience}`);
    if (input.designTools) profileDetails.push(`Design Tools: ${input.designTools}`);
    if (input.portfolioLink) profileDetails.push(`Portfolio: ${input.portfolioLink}`);
    if (input.city) profileDetails.push(`City: ${input.city}`);
    if (input.preferredBatch) profileDetails.push(`Preferred Batch: ${input.preferredBatch}`);
    if (input.whyJoin) profileDetails.push(`Why Join: ${input.whyJoin}`);
    if (input.notes) profileDetails.push(`Notes: ${input.notes}`);

    const consolidatedNotes = profileDetails.length > 0 ? profileDetails.join('\n') : null;

    const student = await studentRepository.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      whatsappNumber: input.whatsappNumber || null,
      courseId: course.id,
      notes: consolidatedNotes,
      status: 'new',
      registeredAt: new Date(),
    });

    // Asynchronously trigger automated Email and WhatsApp workflows
    // Notification failure will never block or fail the student registration response
    setImmediate(() => {
      communicationService.triggerStudentRegistrationCommunications(student).catch((err) => {
        console.error('Async background student communication failed:', err);
      });
    });

    return student;
  }

  async getStudents(options: StudentFilterOptions = {}): Promise<PaginatedResult<Student>> {
    return studentRepository.findAll(options);
  }

  async getStudentById(id: string): Promise<Student> {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new NotFoundError(`Student with ID "${id}" was not found`);
    }
    return student;
  }

  async updateStudentStatus(id: string, input: UpdateStudentStatusInput): Promise<Student> {
    const existing = await studentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Student with ID "${id}" was not found`);
    }

    const updated = await studentRepository.updateStatus(id, input.status, input.notes);

    // If status changed to enrolled, log enrollment confirmation
    if (existing.status !== 'enrolled' && input.status === 'enrolled') {
      try {
        await communicationLogRepository.create({
          recipientType: 'student',
          recipientId: id,
          channel: existing.whatsappNumber ? 'whatsapp' : 'email',
          templateName: 'student_enrolled_confirmation',
          payload: {
            studentName: existing.fullName,
            courseTitle: existing.course?.title,
            enrolledAt: new Date(),
          },
          status: 'sent',
        });
      } catch (logErr) {
        console.warn('Could not record communication log for student enrollment:', logErr);
      }
    }

    return updated!;
  }
}

export const studentService = new StudentService();
