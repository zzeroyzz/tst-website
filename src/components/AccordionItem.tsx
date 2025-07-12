import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AccordionItem.module.css";
import clsx from "clsx"; // Import clsx to combine classes

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  answer,
  isOpen,
  onClick,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shadow} />
      <div className={styles.item}>
        <button
          className={clsx(
            styles.button,
            // These classes replace the default outline with a custom one
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-tst-purple focus-visible:ring-offset-2 rounded-lg"
          )}
          onClick={onClick}
        >
          <span className="text-left font-bold">{question}</span>
          <div className="text-2xl font-bold">
            {isOpen ? <>&mdash;</> : <>=</>}
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: "16px" }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="pb-4 px-6 text-left">{answer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AccordionItem;
