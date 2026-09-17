export default function Select({
  label,
  error,
  id,
  options = [],
  placeholder = 'Select...',
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`form-input ${error ? 'border-danger-500 focus:ring-danger-500' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
