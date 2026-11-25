import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Course } from './Course';

export type StudentStatus = 'new' | 'contacted' | 'enrolled' | 'dropped';

export interface StudentAttributes {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber?: string | null;
  courseId: string;
  status: StudentStatus;
  notes?: string | null;
  registeredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  course?: Course;
}

export interface StudentCreationAttributes
  extends Optional<StudentAttributes, 'id' | 'whatsappNumber' | 'status' | 'notes' | 'registeredAt'> {}

export class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare phone: string;
  declare whatsappNumber: string | null;
  declare courseId: string;
  declare status: StudentStatus;
  declare notes: string | null;
  declare registeredAt: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly course?: Course;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    whatsappNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'whatsapp_number',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'course_id',
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'enrolled', 'dropped'),
      allowNull: false,
      defaultValue: 'new',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    registeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'registered_at',
    },
  },
  {
    sequelize,
    tableName: 'students',
    modelName: 'Student',
  }
);
