import { LIST_QUOTES, ListQuotePath } from "@/constants/listQuotes";
import { useMemo } from "react";

interface ListEndQuoteProps {
  path: ListQuotePath;
  className?: string;
}

export default function ListEndQuote({
  path,
  className = "",
}: ListEndQuoteProps) {
  const quotes = LIST_QUOTES[path];
  if (!quotes || quotes.length === 0) return null;

  const quote = useMemo(() => {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
  }, [path, quotes]);

  return (
    <blockquote
      className={`text-center text-gray-500 text-sm md:text-base italic py-6 md:py-8 px-4 max-w-xl mx-auto border-t border-gray-100 mt-4 ${className}`}
    >
      “{quote}”
    </blockquote>
  );
}