// src/app/resources/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import Section from "@/components/Section";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Highlight from "@/components/Highlight";
import ResourceCard from "@/components/ResourceCard";
import WallOfLove from "@/components/WallOfLove";
import { LottiePlayer } from '@/components/LottiePlayer';
import { Post } from "@/types";
import { toastyTidbitsAnimation } from "@/data/animations";
import { resourcesPageData } from "@/data/resourceData";

const ResourcesPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClientComponentClient());

  useEffect(() => {
    const fetchPublishedPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, created_at, sent_at, image_url, tags, slug")
        .eq("status", "published")
        .order("sent_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } else {
        setPosts(data as Post[]);
      }
      setLoading(false);
    };

    fetchPublishedPosts();
  }, [supabase]);

  return (
    <>
      <Section>
        <div className="flex flex-col items-center gap-16">

          <div className="grid md:grid-cols-2 gap-16 items-center w-full">
           <div className="flex flex-col items-center justify-center">
  <div className="w-full max-w-sm flex justify-center hidden md:block lg:block">
  <LottiePlayer
    file={toastyTidbitsAnimation}
    width={400}
    height={400}
  />
</div>
<div className="w-full max-w-sm flex justify-center md:hidden lg:hidden">
  <LottiePlayer
    file={toastyTidbitsAnimation}
    width={200}
    height={200}
  />
</div>
<div className="w-full flex justify-center -mt-10">
  <h1 className="text-black font-black text-6xl md:text-8xl lg:text-[10rem] text-center leading-tight">
    {resourcesPageData.hero.title.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < resourcesPageData.hero.title.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))}
  </h1>
</div>
</div>
            <div className="flex flex-col gap-6">
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                {resourcesPageData.hero.headline}
              </h1>
              <div className="text-lg space-y-4">
                <p>
                  {resourcesPageData.hero.description.main}
                </p>
                <ul className="space-y-2">
                  {resourcesPageData.hero.description.tools.map((tool, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      <em className="font-bold">{tool}</em>
                    </li>
                  ))}
                </ul>
                <p>
                  {resourcesPageData.hero.description.additional}
                </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-4 mt-4">
                <Input
                  type="email"
                  placeholder={resourcesPageData.hero.emailPlaceholder}
                  name="email"
                  required
                  wrapperClassName="flex-grow"
                />
                <Button type="submit" className="bg-tst-purple">
                  {resourcesPageData.hero.ctaButton}
                </Button>
              </form>
              <p className="text-xs text-gray-600 mt-2">
                {resourcesPageData.hero.privacyNotice.split('privacy policy')[0]}
                <a href={resourcesPageData.routes.privacyPolicy} className="underline">
                  privacy policy
                </a>
                {resourcesPageData.hero.privacyNotice.split('privacy policy')[1]}
              </p>
            </div>
          </div>
         <p className="text-5xl lg:text-6xl font-bold text-center w-full">
            Join <Highlight color="#FFD666">{resourcesPageData.hero.joinersCount}</Highlight> {resourcesPageData.hero.joinersText}
          </p>
        </div>
      </Section>

      <WallOfLove />

      <Section className="mt-16 bg-tst-green border-t-2 border-black">
        <div className="mb-12 text-center px-4">
  <h2 className="text-5xl md:text-6xl font-extrabold">{resourcesPageData.postsSection.title}</h2>
  <p className="text-lg mt-2 font-500">
    {resourcesPageData.postsSection.subtitle}
  </p>
</div>
        {loading ? (
          <p className="text-center">{resourcesPageData.postsSection.loadingText}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <ResourceCard
                key={post.id}
                card={{
                  title: post.title,
                  date: post.sent_at ? format(new Date(post.sent_at), "PPP") : format(new Date(post.created_at), "PPP"),
                  author: resourcesPageData.postsSection.authorName,
                  authorImageUrl: resourcesPageData.postsSection.authorImageUrl,
                  imageUrl: post.image_url || resourcesPageData.postsSection.defaultImageUrl,
                  tags: post.tags,
                  href: `/posts/${post.slug}`,
                }}
              />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link href={resourcesPageData.routes.newsletterArchives}>
            <Button className="bg-tst-yellow">{resourcesPageData.postsSection.viewAllButton}</Button>
          </Link>
        </div>
      </Section>
    </>
  );
};

export default ResourcesPage;
