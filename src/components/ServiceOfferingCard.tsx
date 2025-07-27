import React from "react";
import styles from "./ServiceOfferingCard.module.css";
import Image from "next/image";

interface ServiceOfferingCardProps {
  service: {
    title: string;
    description: string;
    tags: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animationData: any;
  };
}

const ServiceOfferingCard: React.FC<ServiceOfferingCardProps> = ({ service }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shadow} />
      <div className={styles.card}>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-bold">{service.title}</h3>
            <p>{service.description}</p>
            <div>
              <h4 className="font-bold mb-2">Best for:</h4>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-tst-yellow text-sm font-medium px-3 py-1 rounded-full border-2 border-black"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Image src={service.imageUrl} alt="services" width={500} height={500} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOfferingCard;
