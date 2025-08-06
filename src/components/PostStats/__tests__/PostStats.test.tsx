/* eslint-disable @typescript-eslint/no-require-imports */
// src/components/PostStats/__tests__/PostStats.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostStats from '../PostStats';

// Mock the usePostInteractions hook
jest.mock('@/hooks/usePostInteractions', () => ({
  usePostInteractions: jest.fn()
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

// Mock navigator.share and navigator.clipboard
const mockShare = jest.fn();
const mockWriteText = jest.fn();

Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com'
  }
});

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  configurable: true
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText
  },
  configurable: true
});

const mockUsePostInteractions = require('@/hooks/usePostInteractions').usePostInteractions as jest.Mock;
const mockToast = require('react-hot-toast').default;

describe('PostStats', () => {
  const defaultMockData = {
    stats: {
      view_count: 1234,
      like_count: 56,
      liked: false
    },
    loading: false,
    liking: false,
    toggleLike: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePostInteractions.mockReturnValue(defaultMockData);
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      mockUsePostInteractions.mockReturnValue({
        ...defaultMockData,
        loading: true
      });

      render(<PostStats slug="test-slug" />);

      // Should show skeleton elements with animate-pulse class
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBe(3); // view, like, share skeletons
    });
  });

  describe('Data Display', () => {
    it('should display view count correctly', () => {
      render(<PostStats slug="test-slug" />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('should display like count correctly', () => {
      render(<PostStats slug="test-slug" />);

      expect(screen.getByText('56')).toBeInTheDocument();
    });

    it('should display share button', () => {
      render(<PostStats slug="test-slug" />);

      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<PostStats slug="test-slug" className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Like Functionality', () => {
    it('should call toggleLike when like button is clicked', () => {
      const mockToggleLike = jest.fn();
      mockUsePostInteractions.mockReturnValue({
        ...defaultMockData,
        toggleLike: mockToggleLike
      });

      render(<PostStats slug="test-slug" />);

      const likeButton = screen.getByRole('button', { name: /56/i });
      fireEvent.click(likeButton);

      expect(mockToggleLike).toHaveBeenCalledTimes(1);
    });

    it('should show liked state correctly', () => {
      mockUsePostInteractions.mockReturnValue({
        ...defaultMockData,
        stats: {
          ...defaultMockData.stats,
          liked: true
        }
      });

      render(<PostStats slug="test-slug" />);

      const likeButton = screen.getByRole('button', { name: /56/i });
      expect(likeButton).toHaveClass('text-red-600');
    });

    it('should disable like button when liking', () => {
      mockUsePostInteractions.mockReturnValue({
        ...defaultMockData,
        liking: true
      });

      render(<PostStats slug="test-slug" />);

      const likeButton = screen.getByRole('button', { name: /56/i });
      expect(likeButton).toBeDisabled();
      expect(likeButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Share Functionality', () => {
    it('should copy to clipboard and show toast when share button is clicked', async () => {
      mockWriteText.mockResolvedValue(undefined);

      render(<PostStats slug="test-slug" title="Test Article" />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('https://example.com/posts/test-slug');
        expect(mockToast.success).toHaveBeenCalledWith(
          'Link copied to clipboard!',
          expect.objectContaining({
            duration: 3000,
            position: 'top-center',
            icon: '🔗'
          })
        );
      });
    });

    it('should show error toast when clipboard copy fails', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard failed'));

      render(<PostStats slug="test-slug" />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to copy link. Please try again.',
          expect.objectContaining({
            duration: 4000,
            position: 'bottom-center',
            icon: '❌'
          })
        );
      });
    });

    it('should show sharing state during share operation', async () => {
      mockWriteText.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<PostStats slug="test-slug" />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      expect(screen.getByText('Copying...')).toBeInTheDocument();
      expect(shareButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument();
      });
    });

    it('should handle native share API in background', async () => {
      mockWriteText.mockResolvedValue(undefined);
      mockShare.mockResolvedValue(undefined);

      render(<PostStats slug="test-slug" title="Test Article" />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('https://example.com/posts/test-slug');
        expect(mockToast.success).toHaveBeenCalled();
      });

      // Native share might be called, but it's not required for success
    });

    it('should work without title', async () => {
      mockWriteText.mockResolvedValue(undefined);

      render(<PostStats slug="test-slug" />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('https://example.com/posts/test-slug');
        expect(mockToast.success).toHaveBeenCalledWith(
          'Link copied to clipboard!',
          expect.any(Object)
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PostStats slug="test-slug" />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      expect(shareButton).toHaveAttribute('title', 'Copy link to clipboard');
    });

    it('should handle keyboard interactions', () => {
      const mockToggleLike = jest.fn();
      mockUsePostInteractions.mockReturnValue({
        ...defaultMockData,
        toggleLike: mockToggleLike
      });

      render(<PostStats slug="test-slug" />);

      const likeButton = screen.getByRole('button', { name: /56/i });

      // Buttons are focusable by default and don't need explicit type="button" in React
      expect(likeButton.tagName).toBe('BUTTON');

      // Test that button can be clicked
      fireEvent.click(likeButton);
      expect(mockToggleLike).toHaveBeenCalledTimes(1);
    });
  });
});
