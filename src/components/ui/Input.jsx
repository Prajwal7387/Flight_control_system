export default function Input({
  label,
  error,
  id,
  icon: Icon,
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
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          className={`form-input ${Icon ? 'pl-9' : ''} ${
            error ? 'border-danger-500 focus:ring-danger-500' : ''
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
