interface ProgressBarProps {
  progress: string; // Format: "3/10"
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  // Parse progress string (e.g., "3/10")
  const [current, total] = progress.split('/').map(Number);
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-gray-900">{progress}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
