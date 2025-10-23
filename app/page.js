"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DiffViewer from './components/DiffViewer';
import CodeEditor from './components/CodeEditor';
import Image from "next/image";

const SAMPLE_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

export default function Home() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  return (
    <div>

      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Your Code
              </h2>
              <AnimatePresence mode="wait">
                {isReviewing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"
                    />
                    Reviewing your code...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <CodeEditor value={code} onChange={setCode} />
          </motion.div>

      {review && !isReviewing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Suggested Improvement
          </h2>
          <DiffViewer
            originalCode={code}
            improvedCode={review.improvedCode}
            explanation={review.explanation}
            category={review.category}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </motion.div>
      )}
    </div>
  );
}
