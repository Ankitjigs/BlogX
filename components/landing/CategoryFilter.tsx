"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const [selected, setSelected] = useState(categories[0]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updatePill = () => {
      const activeIndex = categories.indexOf(selected);
      const activeButton = buttonRefs.current[activeIndex];

      if (activeButton) {
        setPillStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        });
      }
    };

    updatePill();
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [selected, categories]);

  return (
    <div className="relative flex overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-[#262626] dark:bg-[#161616]">
      {/* Animated Background Pill */}
      <div
        className="absolute bottom-1 top-1 rounded-lg bg-primary shadow-sm transition-all duration-300 ease-in-out"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
        }}
      />

      {/* Categories */}
      {categories.map((category, index) => {
        const isSelected = selected === category;
        return (
          <button
            key={category}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            onClick={() => setSelected(category)}
            className={cn(
              "relative z-10 whitespace-nowrap rounded-lg px-5 py-2 text-sm font-semibold transition-colors duration-200",
              isSelected
                ? "text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
