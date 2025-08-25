import { gql } from '@apollo/client';

/**
 * Create a new contact segment
 */
export const CREATE_CONTACT_SEGMENT = gql`
  mutation CreateContactSegment($input: CreateContactSegmentInput!) {
    createContactSegment(input: $input) {
      id
      name
      description
      color
      createdAt
    }
  }
`;

/**
 * Update an existing contact segment
 */
export const UPDATE_CONTACT_SEGMENT = gql`
  mutation UpdateContactSegment($id: ID!, $input: UpdateContactSegmentInput!) {
    updateContactSegment(id: $id, input: $input) {
      id
      name
      description
      color
      updatedAt
    }
  }
`;

/**
 * Delete a contact segment
 */
export const DELETE_CONTACT_SEGMENT = gql`
  mutation DeleteContactSegment($id: ID!) {
    deleteContactSegment(id: $id)
  }
`;

/**
 * Add contacts to a segment
 */
export const ADD_CONTACTS_TO_SEGMENT = gql`
  mutation AddContactsToSegment($segmentId: ID!, $contactIds: [ID!]!) {
    addContactsToSegment(segmentId: $segmentId, contactIds: $contactIds) {
      successCount
      failureCount
      updatedContacts {
        id
        segments
      }
    }
  }
`;

/**
 * Remove contacts from a segment
 */
export const REMOVE_CONTACTS_FROM_SEGMENT = gql`
  mutation RemoveContactsFromSegment($segmentId: ID!, $contactIds: [ID!]!) {
    removeContactsFromSegment(segmentId: $segmentId, contactIds: $contactIds) {
      successCount
      failureCount
      updatedContacts {
        id
        segments
      }
    }
  }
`;