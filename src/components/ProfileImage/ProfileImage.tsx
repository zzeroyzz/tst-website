import React from 'react';
import Image from 'next/image';

const ProfileImage = () => {
  return (
    <div className="max-w-xl mx-auto">
      <Image
        src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/MYT-v3.png"
        alt="Kay, a Korean American, queer, and neurodivergent therapist."
        width={600}
        height={600}
        className="w-full h-auto"
      />
    </div>
  );
};

export default ProfileImage;
