import { sequelize } from '../config/database';
import { Admin } from './Admin';
import { Course } from './Course';
import { Student } from './Student';
import { Inquiry } from './Inquiry';
import { CommunicationLog } from './CommunicationLog';

// Define Associations
Course.hasMany(Student, {
  foreignKey: 'courseId',
  as: 'students',
  onDelete: 'RESTRICT',
});

Student.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

export {
  sequelize,
  Admin,
  Course,
  Student,
  Inquiry,
  CommunicationLog,
};
