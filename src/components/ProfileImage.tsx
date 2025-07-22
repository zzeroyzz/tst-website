import React from "react";
import Image from "next/image";

const ProfileImage = () => {
  return (

    <div className="max-w-xl mx-auto">
      <Image
        src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/MYT-v2.png"
        alt="Kay, your favorite therapist"
        width={600}
        height={600}
        className="w-full h-auto"
      />
    </div>
  );
};

export default ProfileImage;
