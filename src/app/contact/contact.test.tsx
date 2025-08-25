import { redirect } from 'next/navigation';

// Mock the redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

import ContactPage from './page';

describe('ContactPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /book/trauma when accessed', () => {
    ContactPage();
    
    expect(mockRedirect).toHaveBeenCalledWith('/book/trauma');
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});