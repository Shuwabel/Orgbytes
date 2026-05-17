import { FILTER_OPTIONS, STATUS_LABELS } from "../constants/statusOptions.js";

/**
 * Displays the status filter controls.
 */
export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((filterOption) => {
        const isActive = activeFilter === filterOption;

        return (
          <button
            key={filterOption}
            type="button"
            onClick={() => onFilterChange(filterOption)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-primary text-white"
                : "bg-primary-light text-primary hover:bg-blue-200"
            }`}
          >
            {STATUS_LABELS[filterOption]}
          </button>
        );
      })}
    </div>
  );
}
