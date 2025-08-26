import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    contacts(filters: ContactFilters): [Contact!]!
    contact(id: ID!): Contact
    contactsWithMessages(limit: Int = 50): ContactsWithMessagesResult!
    messages(
      contactId: ID!
      limit: Int = 50
      offset: Int = 0
    ): MessageConnection!
    messageTemplates(category: TemplateCategory): [MessageTemplate!]!
    messageStats: MessageStats!
    contactSegments: [ContactSegment!]!
    workflows: [Workflow!]!
    notifications(limit: Int = 50, unreadOnly: Boolean = false): [Notification!]!
    unreadNotificationCount: Int!
  }

  type Mutation {
    createContact(input: CreateContactInput!): Contact!
    updateContact(id: ID!, input: UpdateContactInput!): Contact!
    deleteContact(id: ID!): Boolean!
    createContactWithAppointment(
      input: CreateContactWithAppointmentInput!
    ): LeadAppointmentResult!
    createLeadWithAppointment(
      input: CreateLeadWithAppointmentInput!
    ): LeadAppointmentResult!
    sendMessage(input: SendMessageInput!): Message!
    createMessageTemplate(input: CreateMessageTemplateInput!): MessageTemplate!
    updateMessageTemplate(
      id: ID!
      input: UpdateMessageTemplateInput!
    ): MessageTemplate!
    deleteMessageTemplate(id: ID!): Boolean!
    createContactSegment(input: CreateContactSegmentInput!): ContactSegment!
    updateContactSegment(
      id: ID!
      input: UpdateContactSegmentInput!
    ): ContactSegment!
    deleteContactSegment(id: ID!): Boolean!
    createWorkflow(input: CreateWorkflowInput!): Workflow!
    updateWorkflow(id: ID!, input: UpdateWorkflowInput!): Workflow!
    deleteWorkflow(id: ID!): Boolean!
    executeWorkflow(workflowId: ID!, contactId: ID!): WorkflowExecution!
    markNotificationRead(id: ID!): Notification!
    markNotificationsRead(ids: [ID!]!): BulkNotificationResult!
    markAllNotificationsRead: BulkNotificationResult!
    deleteNotification(id: ID!): Boolean!
    deleteNotifications(ids: [ID!]!): BulkNotificationResult!
    createNotification(input: CreateNotificationInput!): Notification!
    processIncomingMessage(input: ProcessIncomingMessageInput!): ProcessIncomingMessageResult!
    updateMessageStatus(id: ID, messageSid: String, status: MessageStatus!, errorMessage: String): Message!
    processWebhookFallback(input: WebhookFallbackInput!): WebhookFallbackResult!
    logWebhookMetrics(input: WebhookMetricsInput!): WebhookMetricsResult!
    retryWebhookProcessing(webhookId: ID!, force: Boolean = false): WebhookRetryResult!
  }

  type Subscription {
    messageReceived(contactId: ID): Message!
    contactUpdated(contactId: ID): Contact!
  }

  type Contact {
    id: ID!
    uuid: ID
    user_id: String!
    name: String!
    email: String!
    phoneNumber: String
    contactStatus: ContactStatus!
    segments: [String!]!
    notes: String
    crmNotes: String
    createdAt: String
    updatedAt: String!
    lastMessageAt: String
    messageCount: Int!
    customFields: JSON!

    # Integration with existing lead system
    scheduledAppointmentAt: String
    appointmentStatus: AppointmentStatus
    status: String # Legacy status field
    # Related data
    messages(limit: Int = 10): [Message!]!
    lastMessage: Message
    messagesSent: Int!
    messagesReceived: Int!
  }

  type ContactWithMessage {
    id: ID!
    uuid: ID
    user_id: String!
    name: String!
    email: String!
    phoneNumber: String
    contactStatus: ContactStatus!
    segments: [String!]!
    notes: String
    crmNotes: String
    createdAt: String
    updatedAt: String!
    lastMessageAt: String
    messageCount: Int!
    customFields: JSON!
    scheduledAppointmentAt: String
    appointmentStatus: AppointmentStatus
    status: String

    # Messaging specific fields
    lastMessage: String
    unreadMessageCount: Int!
    messagesSent: Int!
    messagesReceived: Int!
  }

  type ContactsWithMessagesResult {
    contacts: [ContactWithMessage!]!
    hasMore: Boolean!
    total: Int!
  }

  type Message {
    id: ID!
    contactId: ID!
    content: String!
    direction: MessageDirection!
    messageStatus: MessageStatus!
    messageType: MessageType!
    createdAt: String
    updatedAt: String!
    twilioSid: String
    errorMessage: String
    templateId: ID

    # Relations
    contact: Contact!
    template: MessageTemplate
  }

  type MessageConnection {
    messages: [Message!]!
    hasMore: Boolean!
    total: Int!
  }

  type MessageTemplate {
    id: ID!
    name: String!
    content: String!
    category: TemplateCategory!
    variables: [String!]!
    isActive: Boolean!
    createdAt: String
    updatedAt: String!

    # Usage stats
    usageCount: Int!
    lastUsed: String
  }

  type ContactSegment {
    id: ID!
    name: String!
    description: String
    color: String!
    createdAt: String

    # Stats
    contactCount: Int!
  }

  type Workflow {
    id: ID!
    name: String!
    description: String
    triggerType: WorkflowTrigger!
    triggerConditions: JSON!
    actions: JSON!
    isActive: Boolean!
    createdAt: String
    updatedAt: String!

    # Stats
    executionCount: Int!
    lastExecuted: String
  }

  type WorkflowExecution {
    id: ID!
    workflowId: ID!
    contactId: ID!
    status: WorkflowExecutionStatus!
    executedActions: JSON!
    errorMessage: String
    executedAt: String!

    # Relations
    workflow: Workflow!
    contact: Contact!
  }

  type MessageStats {
    totalSent: Int!
    totalReceived: Int!
    totalContacts: Int!
    deliveryRate: Float!
    responseRate: Float!
    sentToday: Int!
    receivedToday: Int!

    # Trends (last 7 days)
    dailyStats: [DailyStat!]!
  }

  type DailyStat {
    date: String!
    sent: Int!
    received: Int!
    delivered: Int!
  }

  type Notification {
    id: ID!
    type: String!
    title: String!
    message: String!
    contactId: ID
    contactName: String
    contactEmail: String
    read: Boolean!
    createdAt: String
    updatedAt: String!

    # Relations
    contact: Contact
  }

  type BulkNotificationResult {
    successCount: Int!
    failureCount: Int!
    updatedNotifications: [Notification!]
  }

  type LeadAppointmentResult {
    contact: Contact!
    appointment: Appointment
    smsTriggered: Boolean!
    messages: [String!]!
  }

  type Appointment {
    id: ID!
    contactId: ID!
    scheduledAt: String!
    status: AppointmentStatus!
    timeZone: String!
    createdAt: String
    updatedAt: String!
    notes: String

    # Relations
    contact: Contact!
  }

  # Enums
  enum ContactStatus {
    ACTIVE
    INACTIVE
    BLOCKED
    PROSPECT
    CLIENT
  }

  enum AppointmentStatus {
    PENDING
    SCHEDULED
    COMPLETED
    CANCELLED
    NO_SHOW
  }

  enum MessageDirection {
    INBOUND
    OUTBOUND
  }

  enum MessageStatus {
    QUEUED
    SENDING
    SENT
    DELIVERED
    FAILED
    RECEIVED
  }

  enum MessageType {
    SMS
    WHATSAPP
    VOICE
  }

  enum TemplateCategory {
    APPOINTMENT_REMINDER
    FOLLOW_UP
    WELCOME
    GENERAL
  }

  enum WorkflowTrigger {
    CONTACT_CREATED
    APPOINTMENT_SCHEDULED
    APPOINTMENT_MISSED
    DAYS_SINCE_CONTACT
  }

  enum WorkflowExecutionStatus {
    PENDING
    COMPLETED
    FAILED
    SKIPPED
  }

  # Input types
  input ContactFilters {
    status: ContactStatus
    segments: [String!]
    hasMessages: Boolean
    appointmentStatus: AppointmentStatus
    search: String
    createdAfter: String
    createdBefore: String
  }

  input CreateContactInput {
    name: String!
    email: String!
    phoneNumber: String
    segments: [String!]
    crmNotes: String
    customFields: JSON
    sendWelcomeEmail: Boolean = false
  }

  input CreateContactWithAppointmentInput {
    name: String!
    email: String!
    phoneNumber: String!
    scheduledAt: String!
    timeZone: String!
    segments: [String!]
    notes: String
    triggerSMSWorkflow: Boolean = true
  }

  input CreateLeadWithAppointmentInput {
    name: String!
    email: String!
    phone: String!
    appointmentDateTime: String!
    timeZone: String!
    segments: [String!]
    notes: String
    triggerSMSWorkflow: Boolean = true
  }

  input UpdateContactInput {
    name: String
    email: String
    phoneNumber: String
    contactStatus: ContactStatus
    segments: [String!]
    crmNotes: String
    appointmentStatus: AppointmentStatus
    customFields: JSON
  }

  input SendMessageInput {
    contactId: ID!
    content: String!
    messageType: MessageType!
    templateId: ID
    templateVariables: JSON
  }

  input CreateMessageTemplateInput {
    name: String!
    content: String!
    category: TemplateCategory!
    variables: [String!]
  }

  input UpdateMessageTemplateInput {
    name: String
    content: String
    category: TemplateCategory
    variables: [String!]
    isActive: Boolean
  }

  input CreateContactSegmentInput {
    name: String!
    description: String
    color: String!
  }

  input UpdateContactSegmentInput {
    name: String
    description: String
    color: String
  }

  input CreateWorkflowInput {
    name: String!
    description: String
    triggerType: WorkflowTrigger!
    triggerConditions: JSON!
    actions: JSON!
  }

  input UpdateWorkflowInput {
    name: String
    description: String
    triggerType: WorkflowTrigger
    triggerConditions: JSON
    actions: JSON
    isActive: Boolean
  }

  input CreateNotificationInput {
    type: String!
    title: String!
    message: String!
    contactId: ID
    contactName: String
    contactEmail: String
  }

  input ProcessIncomingMessageInput {
    messageSid: String!
    from: String!
    to: String!
    body: String!
    messageStatus: String!
  }

  type ProcessIncomingMessageResult {
    message: Message
    contact: Contact
    isNewContact: Boolean!
    notificationCreated: Boolean!
    errors: [String!]!
  }

  input WebhookFallbackInput {
    messageSid: String!
    from: String!
    to: String!
    body: String!
    messageStatus: String!
    retryCount: Int = 0
  }

  type WebhookFallbackResult {
    success: Boolean!
    processedVia: String!
    operationType: String!
    messageId: ID
    contactId: ID
    requiresManualReview: Boolean!
    retryCount: Int!
    errors: [String!]!
  }

  input WebhookMetricsInput {
    operation: String!
    processingTime: Float!
    strategy: String!
    success: Boolean!
    errorMessage: String
  }

  type WebhookMetricsResult {
    success: Boolean!
    metricsId: ID
    processingTime: Float!
    strategy: String!
  }

  type WebhookRetryResult {
    success: Boolean!
    result: WebhookFallbackResult
    errors: [String!]!
    retryCount: Int!
  }

  # Custom scalar for JSON data
  scalar JSON
`;
