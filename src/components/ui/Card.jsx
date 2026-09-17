export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`stat-card ${className}`} {...props}>
      {children}
    </div>
  );
}
