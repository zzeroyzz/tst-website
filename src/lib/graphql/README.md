# GraphQL Architecture Guide

## 🏗️ New Modular Structure

This directory contains the reorganized GraphQL architecture for better maintainability, security, and developer experience.

## 📁 Directory Structure

```
src/lib/graphql/
├── queries/           # All GraphQL queries organized by domain
├── mutations/         # All GraphQL mutations organized by domain
├── hooks/            # Custom React hooks for GraphQL operations
├── resolvers/        # Server-side GraphQL resolvers
└── README.md         # This file
```

## 🔍 Queries (`/queries/`)

### Available Query Files

| File | Description | Key Queries |
|------|-------------|-------------|
| `contacts.ts` | Contact management | `GET_CONTACTS`, `GET_CONTACT`, `GET_CONTACT_SEGMENTS` |
| `messages.ts` | Message operations | `GET_MESSAGES`, `GET_MESSAGE_STATS`, `GET_MESSAGE_TEMPLATES` |
| `appointments.ts` | Appointment queries | `GET_UPCOMING_APPOINTMENTS`, `GET_APPOINTMENT_SUMMARY` |
| `workflows.ts` | Workflow automation | `GET_WORKFLOWS`, `GET_WORKFLOW_EXECUTIONS` |
| `notifications.ts` | Notification system | `GET_UNREAD_NOTIFICATIONS`, `GET_NOTIFICATION_SUMMARY` |
| `dashboard.ts` | Dashboard aggregations | `GET_DASHBOARD_DATA`, `GET_DASHBOARD_OVERVIEW` |

### Usage Example

```typescript
import { GET_CONTACTS, GET_CONTACT } from '@/lib/graphql/queries';
import { useQuery } from '@apollo/client';

// Get all contacts
const { data: contacts, loading } = useQuery(GET_CONTACTS);

// Get specific contact
const { data: contact } = useQuery(GET_CONTACT, {
  variables: { id: '123' }
});
```

## ✏️ Mutations (`/mutations/`)

### Available Mutation Files

| File | Description | Key Mutations |
|------|-------------|---------------|
| `contacts.ts` | Contact CRUD operations | `CREATE_CONTACT`, `UPDATE_CONTACT`, `DELETE_CONTACT` |
| `messages.ts` | Message operations | `SEND_MESSAGE`, `CREATE_MESSAGE_TEMPLATE` |
| `appointments.ts` | Appointment management | `CREATE_APPOINTMENT`, `CANCEL_APPOINTMENT` |
| `segments.ts` | Contact segmentation | `CREATE_CONTACT_SEGMENT`, `UPDATE_CONTACT_SEGMENT` |
| `workflows.ts` | Workflow automation | `CREATE_WORKFLOW`, `EXECUTE_WORKFLOW` |
| `notifications.ts` | Notification management | `MARK_NOTIFICATION_READ`, `DELETE_NOTIFICATION` |

### Usage Example

```typescript
import { CREATE_CONTACT } from '@/lib/graphql/mutations';
import { useMutation } from '@apollo/client';

const [createContact, { loading, error }] = useMutation(CREATE_CONTACT);

const handleCreate = async (input) => {
  await createContact({
    variables: { input },
    refetchQueries: [{ query: GET_CONTACTS }]
  });
};
```

## 🪝 Custom Hooks (`/hooks/`)

### Available Hooks

| Hook | Description | Usage |
|------|-------------|-------|
| `useContacts()` | Contact data management | `const { contacts, loading } = useContacts(filters);` |
| `useContact(id)` | Single contact management | `const { contact, loading } = useContact('123');` |
| `useContactMutations()` | Contact CRUD operations | `const { createContact, updateContact } = useContactMutations();` |
| `useAppointmentBooking()` | Appointment booking flow | `const { bookAppointment, loading } = useAppointmentBooking();` |
| `useNotifications()` | Notification management | `const { notifications, markRead } = useNotifications();` |

### Usage Example

```typescript
import { useAppointmentBooking } from '@/lib/graphql/hooks';

function BookingForm() {
  const { bookAppointment, loading, error } = useAppointmentBooking();

  const handleSubmit = async (formData) => {
    try {
      const result = await bookAppointment(formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
```

## 🔒 Security Features

### Authentication Required
All GraphQL operations require authentication. The Apollo Client is configured to handle authentication headers.

### Row Level Security (RLS)
All database operations are protected with Row Level Security policies that ensure only authenticated users can access data.

### Audit Logging
All data modifications are automatically logged for security and compliance purposes.

## 🚀 Best Practices

### 1. Use Custom Hooks
```typescript
// ✅ Preferred - Use custom hooks
import { useContacts } from '@/lib/graphql/hooks';
const { contacts, loading, error } = useContacts();

// ❌ Avoid - Direct useQuery usage
import { useQuery } from '@apollo/client';
import { GET_CONTACTS } from '@/lib/graphql/queries';
const { data, loading, error } = useQuery(GET_CONTACTS);
```

### 2. Handle Loading and Error States
```typescript
const { contacts, loading, error } = useContacts();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!contacts?.length) return <EmptyState />;

return <ContactList contacts={contacts} />;
```

### 3. Optimize with Proper Cache Policies
```typescript
// The Apollo Client is already configured with optimized cache policies
// Mutations automatically invalidate related queries
const { createContact } = useContactMutations();

// This will automatically refetch GET_CONTACTS
await createContact({ variables: input });
```

### 4. Use TypeScript Types
```typescript
import { Contact, CreateContactInput } from '@/types/graphql';

const { createContact } = useContactMutations();

const handleCreate = async (input: CreateContactInput) => {
  const result = await createContact({ variables: { input } });
  const contact: Contact = result.data?.createContact;
};
```

## 🔄 Migration from Old Structure

### Before (Deprecated)
```typescript
import { GET_CONTACTS, CREATE_CONTACT } from '@/lib/graphql/queries';
```

### After (Current)
```typescript
import { GET_CONTACTS } from '@/lib/graphql/queries';
import { CREATE_CONTACT } from '@/lib/graphql/mutations';
```

### Best Practice (Recommended)
```typescript
import { useContacts, useContactMutations } from '@/lib/graphql/hooks';
```

## 📚 Additional Resources

- [GraphQL Security Audit Report](../../../GRAPHQL_SECURITY_AUDIT_REPORT.md)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

## 🐛 Troubleshooting

### Common Issues

#### Authentication Errors
```
Error: Access denied. Authentication required.
```
**Solution:** Ensure user is logged in and has proper authentication headers.

#### Cache Issues
```
Error: Cannot return null for non-nullable field
```
**Solution:** Clear Apollo Client cache or check query field selection.

#### TypeScript Errors
```
Error: Property does not exist on type
```
**Solution:** Regenerate GraphQL types with `npm run codegen`.

## 🤝 Contributing

When adding new GraphQL operations:

1. **Add queries** to appropriate file in `/queries/`
2. **Add mutations** to appropriate file in `/mutations/`
3. **Create custom hooks** in `/hooks/` for complex operations
4. **Update index files** to export new operations
5. **Add TypeScript types** if needed
6. **Write tests** for new functionality

---

**Architecture Status:** ✅ **Production Ready**  
**Security Level:** 🔒 **Enterprise Grade**  
**Developer Experience:** 🚀 **Optimized**