// src/components/NewsletterPreviewModal.tsx
import React from 'react';
import Button from '@/components/Button/Button';

interface NewsletterPreviewModalProps {
  htmlContent: string;
  onClose: () => void;
  onSend: () => void;
  isSending: boolean;
}

const NewsletterPreviewModal: React.FC<NewsletterPreviewModalProps> = ({
  htmlContent,
  onClose,
  onSend,
  isSending,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      {/* Updated sizing: Changed height to h-full to take up the maximum vertical space within the padded container */}
      <div className="bg-white rounded-lg shadow-brutalistLg w-full max-w-6xl h-full flex flex-col border-2 border-black">
        <div className="flex justify-between items-center p-4 border-b-2 border-black flex-shrink-0">
          <h2 className="text-2xl font-bold">Newsletter Preview</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto">
          <iframe
            srcDoc={htmlContent}
            title="Newsletter Preview"
            className="w-full h-full border-0"
          />
        </div>
        <div className="flex justify-end items-center p-4 border-t-2 border-black gap-4 flex-shrink-0">
          <Button onClick={onClose} className="bg-gray-200" disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={onSend} className="bg-tst-green" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Newsletter'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPreviewModal;
