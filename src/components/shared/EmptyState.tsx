// src/components/shared/EmptyState.tsx
// Empty state component for lists and tables
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mb-4 flex justify-center opacity-30">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg font-medium text-sm"
          style={{
            backgroundColor: COLORS.maxionGreen,
            color: COLORS.obsidianBlack,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
