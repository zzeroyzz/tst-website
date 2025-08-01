import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ResourceCard.module.css';
import clsx from 'clsx';

interface ResourceCardProps {
  card: {
    title: string;
    date: string;
    author: string;
    authorImageUrl: string;
    imageUrl: string;
    tags?: string[];
    href: string;
  };
}

const ResourceCard: React.FC<ResourceCardProps> = ({ card }) => {
  const tagColors = ["bg-tst-purple", "bg-tst-teal", "bg-tst-yellow"];

  return (
    <Link href={card.href} className={styles.wrapper}>
      <div className={styles.shadow} />
      <div className={styles.card}>
        {/* Fixed image container with 3:2 aspect ratio for 600x400 images - much smaller size with border */}
        <div className="p-3">
          <div className="relative w-full max-w-[200px] mx-auto border-2 border-black rounded-lg overflow-hidden" style={{ aspectRatio: '3/2' }}>
            <Image
              src={card.imageUrl}
              alt={card.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 200px"
            />
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-base font-bold mb-2">{card.title}</h3>
          <p className="text-xs text-gray-600 mb-4">{card.date}</p>
          <div className="flex-grow" />
          {card.tags && card.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {card.tags.slice(0, 2).map((tag, index) => (
                <div
                  key={tag}
                  className={clsx(
                    'inline-block text-xs font-bold px-3 py-1 rounded-full border-2 border-black',
                    tagColors[index % tagColors.length]
                  )}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-black bg-tst-yellow">
              <Image
                src={card.authorImageUrl}
                alt={card.author}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm font-bold">{card.author}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ResourceCard;
