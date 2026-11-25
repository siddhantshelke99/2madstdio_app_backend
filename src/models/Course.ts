import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type CourseMode = 'online' | 'offline' | 'hybrid';

export interface SyllabusItem {
  weekOrModule: string;
  topic: string;
  details?: string[];
}

export interface CourseAttributes {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  fee: number;
  mode: CourseMode;
  syllabus: SyllabusItem[] | Record<string, any>;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseCreationAttributes
  extends Optional<CourseAttributes, 'id' | 'isPublished' | 'syllabus'> {}

export class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  declare id: string;
  declare title: string;
  declare slug: string;
  declare description: string;
  declare duration: string;
  declare fee: number;
  declare mode: CourseMode;
  declare syllabus: SyllabusItem[] | Record<string, any>;
  declare isPublished: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('fee');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
    },
    mode: {
      type: DataTypes.ENUM('online', 'offline', 'hybrid'),
      allowNull: false,
      defaultValue: 'offline',
    },
    syllabus: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_published',
    },
  },
  {
    sequelize,
    tableName: 'courses',
    modelName: 'Course',
  }
);
