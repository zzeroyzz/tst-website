import React from "react";
import Image from "next/image";

const ProfileImage = () => {
  return (

    <div className="max-w-xs mx-auto">
      <Image
        src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/MYT.svg"
        alt="Kay, your therapist"
        width={400}
        height={450}
        className="w-full h-auto"
      />
    </div>
  );
};

export default ProfileImage;
