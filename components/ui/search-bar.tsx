"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import SearchResults from "./search-results";

export default function SearchBar({
  isMobile,
  className,
}: {
  isMobile?: boolean;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ posts: [], authors: [], tags: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results
  useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.length < 2) {
        setResults({ posts: [], authors: [], tags: [] });
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
        );
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery("");
    setResults({ posts: [], authors: [], tags: [] });
    setIsOpen(false);
  };

  const handleSelect = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full max-w-sm ${className ? className : isMobile ? "block" : "hidden lg:block"}`}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="Search posts..."
        className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:bg-secondary dark:border-none dark:shadow-none"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      )}

      {isOpen && (
        <SearchResults
          results={results}
          isLoading={isLoading}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
