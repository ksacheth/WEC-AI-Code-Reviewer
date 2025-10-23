"use client";
import { motion, AnimatePresence } from "motion/react";
import { parseDiff, Diff, Hunk } from "react-diff-view";
import { diffLines, formatLines } from "unidiff";
const CATEGORY_COLORS = {
  "Best Practices":
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  "Better Performance":
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  "Bug Fix":
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  "Code Quality":
    "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  "Security Fix":
    "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
};

export default function DiffViewer({
  originalCode,
  improvedCode,
  explanation,
  category,
  onAccept,
  onDecline,
}) {
  const diffText = useMemo(() => {
    const oldLines = originalCode.split("\n");
    const newLines = improvedCode.split("\n");

    const diffResult = diffLines(oldLines, newLines);
    return formatLines(diffResult, { context: 3 });
  }, [originalCode, improvedCode]);

  const files = useMemo(() => {
    try {
      return parseDiff(diffText, { nearbySequences: "zip" });
    } catch (error) {
      console.error("Error parsing diff:", error);
      return [];
    }
  }, [diffText]);
  const categoryColor =
    CATEGORY_COLORS[category] || CATEGORY_COLORS["Best Practices"];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-900"
      >
        {/* Header with category badge and explanation */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${categoryColor}`}
              >
                {category}
              </span>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDecline}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-medium text-sm transition-colors duration-200"
            >
              Decline
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors duration-200 shadow-sm"
            >
              Accept Changes
            </motion.button>
          </div>
        </div>

        {/* Diff view */}
        <div className="overflow-x-auto bg-gray-50 dark:bg-gray-950">
          {files.map((file, index) => (
            <Diff
              key={index}
              viewType="split"
              diffType={file.type}
              hunks={file.hunks}
              className="text-xs"
            >
              {(hunks) =>
                hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
              }
            </Diff>
          ))}

          {files.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No changes to display</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
