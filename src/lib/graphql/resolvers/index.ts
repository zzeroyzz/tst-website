import { GraphQLScalarType, Kind } from 'graphql';
import { contactResolvers } from './contacts';
import { messageResolvers } from './messages';
import { templateResolvers } from './templates';
import { segmentResolvers } from './segments';
import { workflowResolvers } from './workflows';
import { statsResolvers } from './stats';
import { notificationResolvers } from './notifications';
import { webhookResolvers } from './webhooks';

// Custom JSON scalar
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT: {
        const value = Object.create(null);
        ast.fields.forEach(field => {
          value[field.name.value] = this.parseLiteral!(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return ast.values.map(n => this.parseLiteral!(n));
      default:
        return null;
    }
  },
});

export const resolvers = {
  JSON: JSONScalar,

  Query: {
    ...contactResolvers.Query,
    ...messageResolvers.Query,
    ...templateResolvers.Query,
    ...segmentResolvers.Query,
    ...workflowResolvers.Query,
    ...statsResolvers.Query,
    ...notificationResolvers.Query,
  },

  Mutation: {
    ...contactResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...templateResolvers.Mutation,
    ...segmentResolvers.Mutation,
    ...workflowResolvers.Mutation,
    ...notificationResolvers.Mutation,
    ...webhookResolvers.Mutation,
  },

  Subscription: {
    ...messageResolvers.Subscription,
    ...contactResolvers.Subscription,
  },

  // Field resolvers
  Contact: contactResolvers.Contact,
  ContactWithMessage: {
    // Use the same field resolvers as Contact
    phoneNumber: (parent: any) => parent.phone_number,
    contactStatus: (parent: any) => parent.contact_status || 'ACTIVE',
    crmNotes: (parent: any) => parent.crm_notes,
    customFields: (parent: any) => parent.custom_fields || {},
    lastMessageAt: (parent: any) => parent.last_message_at,
    messageCount: (parent: any) => parent.message_count || 0,
    segments: (parent: any) => parent.segments || [],
    scheduledAppointmentAt: (parent: any) => parent.scheduled_appointment_at,
    appointmentStatus: (parent: any) => parent.appointment_status,
    status: (parent: any) => parent.status,
    messagesSent: (parent: any) => parent.messagesSent || 0,
    messagesReceived: (parent: any) => parent.messagesReceived || 0,
  },
  Message: messageResolvers.Message,
  MessageTemplate: templateResolvers.MessageTemplate,
  ContactSegment: segmentResolvers.ContactSegment,
  Workflow: workflowResolvers.Workflow,
  WorkflowExecution: workflowResolvers.WorkflowExecution,
  Notification: notificationResolvers.Notification,
};
