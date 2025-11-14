interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ title = 'Error', message, onRetry }: ErrorMessageProps) => (
  <div className="rounded-lg bg-red-50 p-6 text-center">
    <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
    <p className="text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);
