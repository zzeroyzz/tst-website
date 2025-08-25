// src/components/ContactInfo/ContactInfo.tsx
import Link from 'next/link';

interface ContactInfoProps {
  showTitle?: boolean;
  className?: string;
}

export default function ContactInfo({ 
  showTitle = true, 
  className = '' 
}: ContactInfoProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <h3 className="text-xl font-semibold text-black">Contact Information</h3>
      )}
      
      <div className="space-y-2">
        {/* Email */}
        <div className="flex items-center space-x-3">
          <span className="font-medium text-black">Email:</span>
          <Link 
            href="mailto:care@toastedsesametherapy.com"
            className="text-blue-600 hover:text-blue-800 underline"
            aria-label="Send email to Toasted Sesame Therapy"
          >
            care@toastedsesametherapy.com
          </Link>
        </div>

        {/* Service Area */}
        <div className="flex items-center space-x-3">
          <span className="font-medium text-black">Service Area:</span>
          <span className="text-gray-700">Georgia (Virtual Sessions)</span>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-3">
          <span className="font-medium text-black">Based in:</span>
          <span className="text-gray-700">Atlanta, Georgia</span>
        </div>

        {/* Hours */}
        <div className="flex items-center space-x-3">
          <span className="font-medium text-black">Hours:</span>
          <span className="text-gray-700">Monday - Friday, 9:00 AM - 5:00 PM EST</span>
        </div>

        {/* License */}
        <div className="flex items-center space-x-3">
          <span className="font-medium text-black">License:</span>
          <span className="text-gray-700">LPC013996 (Georgia)</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-tst-beige border border-black rounded">
        <p className="text-sm text-gray-600">
          <strong>Virtual Sessions Only:</strong> All therapy sessions are conducted online 
          via secure, HIPAA-compliant video platform for clients located in Georgia.
        </p>
      </div>
    </div>
  );
}