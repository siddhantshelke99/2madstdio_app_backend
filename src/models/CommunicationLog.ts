import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type RecipientType = 'student' | 'inquiry';
export type CommunicationChannel = 'email' | 'whatsapp';
export type CommunicationStatus = 'sent' | 'failed';

export interface CommunicationLogAttributes {
  id: string;
  recipientType: RecipientType;
  recipientId: string;
  channel: CommunicationChannel;
  templateName: string;
  payload: Record<string, any>;
  status: CommunicationStatus;
  errorMessage?: string | null;
  sentAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommunicationLogCreationAttributes
  extends Optional<CommunicationLogAttributes, 'id' | 'payload' | 'errorMessage' | 'sentAt'> {}

export class CommunicationLog
  extends Model<CommunicationLogAttributes, CommunicationLogCreationAttributes>
  implements CommunicationLogAttributes {
  declare id: string;
  declare recipientType: RecipientType;
  declare recipientId: string;
  declare channel: CommunicationChannel;
  declare templateName: string;
  declare payload: Record<string, any>;
  declare status: CommunicationStatus;
  declare errorMessage: string | null;
  declare sentAt: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CommunicationLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    recipientType: {
      type: DataTypes.ENUM('student', 'inquiry'),
      allowNull: false,
      field: 'recipient_type',
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'recipient_id',
    },
    channel: {
      type: DataTypes.ENUM('email', 'whatsapp'),
      allowNull: false,
    },
    templateName: {
      type: DataTypes.STRING(128),
      allowNull: false,
      field: 'template_name',
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM('sent', 'failed'),
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'sent_at',
    },
  },
  {
    sequelize,
    tableName: 'communication_logs',
    modelName: 'CommunicationLog',
  }
);
