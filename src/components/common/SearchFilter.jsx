import { Search } from 'lucide-react';

export default function SearchFilter({
  searchValue,
  onSearchChange,
  placeholder = 'Search...',
  filters = [],
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Search input */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="form-input pl-9"
        />
      </div>
      {/* Filter dropdowns */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="form-input w-full sm:w-auto sm:min-w-[160px]"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
