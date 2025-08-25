import { contactResolvers } from '../contacts';
import { GraphQLError } from 'graphql';

// Mock the email sender
jest.mock('@/lib/zapier-email-sender');
jest.mock('@/lib/custom-email-templates');

describe('Contact Resolvers', () => {
  let mockSupabase: any;
  let mockContext: any;

  beforeEach(() => {
    // Reset mocks
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
    };

    mockContext = {
      supabase: mockSupabase,
      user: null,
      session: null,
    };
  });

  describe('Query.contacts', () => {
    it('should fetch contacts with user_id field included', async () => {
      const mockContacts = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          user_id: 'user-123',
          contact_status: 'ACTIVE',
        },
      ];

      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.order.mockResolvedValue({ data: mockContacts, error: null });

      const result = await contactResolvers.Query.contacts(null, {}, mockContext);

      expect(mockSupabase.from).toHaveBeenCalledWith('contacts');
      expect(mockSupabase.select).toHaveBeenCalledWith(
        expect.stringContaining('user_id')
      );
      expect(result).toEqual(mockContacts);
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database connection failed' };
      mockSupabase.order.mockResolvedValue({ data: null, error: mockError });

      await expect(
        contactResolvers.Query.contacts(null, {}, mockContext)
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Query.contact', () => {
    it('should fetch single contact with user_id field included', async () => {
      const mockContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        user_id: 'user-123',
        contact_status: 'ACTIVE',
      };

      mockSupabase.single.mockResolvedValue({ data: mockContact, error: null });

      const result = await contactResolvers.Query.contact(
        null,
        { id: 1 },
        mockContext
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('contacts');
      expect(mockSupabase.select).toHaveBeenCalledWith(
        expect.stringContaining('user_id')
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1);
      expect(result).toEqual(mockContact);
    });
  });

  describe('Mutation.createContact', () => {
    it('should create a new contact with user_id automatically generated', async () => {
      const mockInput = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '555-123-4567',
        segments: ['New Lead'],
      };

      const mockCreatedContact = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone_number: '555-123-4567',
        user_id: 'user-456',
        segments: ['New Lead'],
      };

      // Mock the existing contact check (should return no existing contact)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      // Mock the contact insert operation 
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({
            data: mockCreatedContact,
            error: null,
          })
        })
      });

      // Mock notification insert
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: null })
      });

      const result = await contactResolvers.Mutation.createContact(
        null,
        { input: mockInput },
        mockContext
      );

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone_number: '555-123-4567',
          phone: '555-123-4567', // Legacy compatibility
          contact_status: 'ACTIVE',
          segments: ['New Lead'],
        }),
      ]);
      expect(result).toEqual(mockCreatedContact);
    });

    it('should prevent duplicate email addresses', async () => {
      const mockInput = {
        name: 'Jane Doe',
        email: 'existing@example.com',
        phoneNumber: '555-123-4567',
      };

      const existingContact = {
        id: 1,
        email: 'existing@example.com',
        name: 'Existing User',
      };

      // Mock existing contact found
      mockSupabase.single.mockResolvedValue({
        data: existingContact,
        error: null,
      });

      await expect(
        contactResolvers.Mutation.createContact(
          null,
          { input: mockInput },
          mockContext
        )
      ).rejects.toThrow(GraphQLError);
      await expect(
        contactResolvers.Mutation.createContact(
          null,
          { input: mockInput },
          mockContext
        )
      ).rejects.toThrow(/already exists/);
    });
  });

  describe('Mutation.createLeadWithAppointment', () => {
    it('should create a new contact with new tag and appointment', async () => {
      const mockInput = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-123-4567',
        appointmentDateTime: '2024-01-15T14:00:00Z',
        timeZone: 'America/New_York',
        segments: ['Booking Lead'],
      };

      const mockContact = {
        id: 3,
        name: 'John Smith',
        email: 'john@example.com',
        phone_number: '555-123-4567',
        user_id: 'user-789',
        segments: ['Booking Lead', 'new'], // Should include 'new' tag
      };

      const mockAppointment = {
        id: 1,
        contact_id: 3,
        scheduled_at: '2024-01-15T14:00:00Z',
        status: 'SCHEDULED',
        uuid: 'appointment-uuid-123',
      };

      // Mock no existing contact
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

      // Mock contact insert operation
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({
            data: mockContact,
            error: null,
          })
        })
      });

      // Mock appointment insert operation
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({
            data: mockAppointment,
            error: null,
          })
        })
      });

      // Mock successful contact update and notification insert
      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      });
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: null })
      });

      const result = await contactResolvers.Mutation.createLeadWithAppointment(
        null,
        { input: mockInput },
        mockContext
      );

      // Verify contact creation includes 'new' tag
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          segments: ['Booking Lead', 'new'],
        }),
      ]);

      expect(result).toMatchObject({
        contact: mockContact,
        appointment: mockAppointment,
      });
    });
  });

  describe('Contact field resolvers', () => {
    it('should resolve contactStatus field correctly', () => {
      const mockParent = { contact_status: 'PROSPECT' };
      const result = contactResolvers.Contact.contactStatus(mockParent);
      expect(result).toBe('PROSPECT');
    });

    it('should resolve phoneNumber field correctly', () => {
      const mockParent = { phone_number: '555-123-4567' };
      const result = contactResolvers.Contact.phoneNumber(mockParent);
      expect(result).toBe('555-123-4567');
    });

    it('should resolve segments field with default empty array', () => {
      const mockParent = {};
      const result = contactResolvers.Contact.segments(mockParent);
      expect(result).toEqual([]);
    });
  });

  describe('Appointment field resolvers', () => {
    it('should resolve contactId field correctly', () => {
      const mockParent = { contact_id: 123 };
      const result = contactResolvers.Appointment.contactId(mockParent);
      expect(result).toBe(123);
    });

    it('should resolve scheduledAt field correctly', () => {
      const mockParent = { scheduled_at: '2024-01-15T14:00:00Z' };
      const result = contactResolvers.Appointment.scheduledAt(mockParent);
      expect(result).toBe('2024-01-15T14:00:00Z');
    });
  });
});