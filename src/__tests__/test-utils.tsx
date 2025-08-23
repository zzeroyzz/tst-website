// src/__tests__/test-utils.js
import { render } from '@testing-library/react';

// Create a proper mock chain for Supabase queries
const createSupabaseQueryChain = () => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null }),
  };
  return chain;
};

// Mock Supabase client with all necessary methods
export const mockSupabaseClient = {
  from: jest.fn(() => createSupabaseQueryChain()),
  channel: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
  }),
  removeChannel: jest.fn(),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: jest
      .fn()
      .mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: jest
      .fn()
      .mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: jest
        .fn()
        .mockReturnValue({ data: { publicUrl: 'mock-url' } }),
    }),
  },
};

// Create mock contact helper (this was missing!)
export const createMockContact = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  status: 'New',
  phone: null,
  company: null,
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Create mock post helper
export const createMockPost = (overrides = {}) => ({
  id: '123',
  title: 'Test Post',
  subject: 'Test Subject',
  body: 'Test body content',
  tags: ['anxiety'],
  archive_posts: [],
  image_url: null,
  status: 'draft',
  slug: 'test-post',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Mock API response helpers
export const mockApiResponse = (data = {}, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

export const mockApiError = (message = 'API Error', status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: message }),
  text: () => Promise.resolve(JSON.stringify({ error: message })),
});

// Custom render function (if you need providers later)
export const customRender = (ui, options) => render(ui, options);

// Re-export everything
export * from '@testing-library/react';
