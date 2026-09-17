import Button from '../ui/Button';

export default function PageHeader({ title, subtitle, action, actionLabel, actionIcon: ActionIcon, onAction }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action || (onAction && (
        <Button onClick={onAction}>
          {ActionIcon && <ActionIcon size={16} />}
          {actionLabel}
        </Button>
      ))}
    </div>
  );
}
