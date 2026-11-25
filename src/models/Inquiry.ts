import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type InquiryType = 'studio_project' | 'academy_general';
export type InquiryStatus = 'open' | 'resolved';

export interface InquiryAttributes {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: InquiryType;
  message: string;
  status: InquiryStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InquiryCreationAttributes
  extends Optional<InquiryAttributes, 'id' | 'status'> {}

export class Inquiry extends Model<InquiryAttributes, InquiryCreationAttributes> implements InquiryAttributes {
  declare id: string;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare type: InquiryType;
  declare message: string;
  declare status: InquiryStatus;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Inquiry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    type: {
      type: DataTypes.ENUM('studio_project', 'academy_general'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'resolved'),
      allowNull: false,
      defaultValue: 'open',
    },
  },
  {
    sequelize,
    tableName: 'inquiries',
    modelName: 'Inquiry',
  }
);
