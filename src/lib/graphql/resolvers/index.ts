import { GraphQLScalarType, Kind } from 'graphql';
import { contactResolvers } from './contacts';
import { messageResolvers } from './messages';
import { templateResolvers } from './templates';
import { segmentResolvers } from './segments';
import { workflowResolvers } from './workflows';
import { statsResolvers } from './stats';
import { notificationResolvers } from './notifications';

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
  },

  Subscription: {
    ...messageResolvers.Subscription,
    ...contactResolvers.Subscription,
  },

  // Field resolvers
  Contact: contactResolvers.Contact,
  Message: messageResolvers.Message,
  MessageTemplate: templateResolvers.MessageTemplate,
  ContactSegment: segmentResolvers.ContactSegment,
  Workflow: workflowResolvers.Workflow,
  WorkflowExecution: workflowResolvers.WorkflowExecution,
  Notification: notificationResolvers.Notification,
};
