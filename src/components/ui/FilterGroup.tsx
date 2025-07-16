import React from "react";
import { FilterProps } from "../../types";

const FilterGroup: React.FC<FilterProps> = ({
  filterOptions,
  activeFilter,
  onFilterChange,
  label,
}) => {
  return (
    <div className="flex flex-col space-y-1 min-w-0 flex-1">
      {label && (
        <label
          htmlFor={label}
          className="text-xs font-medium text-secondary-700 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <select
        id={label}
        value={activeFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="rounded-md border-secondary-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
      >
        {filterOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterGroup;
