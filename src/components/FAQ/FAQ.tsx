"use client";

import React, { useState } from "react";
import { faqData } from "@/data/faqData";
import AccordionItem from "./AccordionItem";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-5xl font-extrabold text-center mb-8">
        Answers to common questions
      </h2>
      <div className="flex flex-col gap-4">
        {faqData.map((item, index) => (
          <AccordionItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onClick={() => handleToggle(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
