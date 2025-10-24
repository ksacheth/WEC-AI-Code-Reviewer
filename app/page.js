"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import DiffViewer from "./components/DiffViewer";
import CodeEditor from "./components/CodeEditor";
import Image from "next/image";

const SAMPLE_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Home() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const debouncedCode = useDebounce(code, 1500);

  useEffect(() => {
    if (debouncedCode.trim().length === 0) {
      setReview(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const reviewCode = async () => {
      setIsReviewing(true);
      setError(null);

      try {
        const response = await fetch("/api/review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: debouncedCode }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to review code");
        }

        const data = await response.json();
        setReview(data.review);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Error reviewing code:", err);
          setError(err.message);
        }
      } finally {
        setIsReviewing(false);
      }
    };
    reviewCode();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedCode]);

  const handleAccept = () => {
    if (review) {
      setCode(review.improvedCode);
      setReview(null);
    }
  };

  const handleDecline = () => {
    setReview(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
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
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
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
      </div>
    </main>
  );
}
