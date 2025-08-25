import React from 'react';
import Image from 'next/image';

interface ProfileImageProps {
  width?: number;
  height?: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ width = 600, height = 600 }) => {
  return (
    <div className="max-w-xl mx-auto">
      <Image
        src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/MYT-v3.png"
        alt="Kay, a Korean American, queer, and neurodivergent therapist."
        width={width}
        height={height}
        className="w-full h-auto"
      />
    </div>
  );
};

export default ProfileImage;
