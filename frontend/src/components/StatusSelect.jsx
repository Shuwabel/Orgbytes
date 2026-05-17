import { useEffect, useRef, useState } from "react";
import { FILTER_OPTIONS, STATUS, STATUS_LABELS } from "../constants/statusOptions.js";

const STATUS_OPTIONS = FILTER_OPTIONS.filter((option) => option !== STATUS.ALL);

/**
 * Renders an arrow-only trigger with a custom status dropdown menu.
 */
export default function StatusSelect({ userName, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (nextStatus) => {
    onChange(nextStatus);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Update ${userName} status`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentState) => !currentState)}
        className="flex h-9 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
          <path
            d="M5.47 7.97a.75.75 0 0 1 1.06 0L10 11.44l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={`${userName} status options`}
          className="absolute right-0 z-20 mt-2 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {STATUS_OPTIONS.map((status) => {
            const isSelected = status === value;

            return (
              <button
                key={status}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(status)}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm ${
                  isSelected
                    ? "bg-primary-light font-medium text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{STATUS_LABELS[status]}</span>
                <span className={isSelected ? "text-primary" : "opacity-0"}>
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
                    <path
                      d="m7.75 13.08-3.03-3.03-1.06 1.06 4.09 4.08 8.59-8.58-1.06-1.06-7.53 7.53Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

