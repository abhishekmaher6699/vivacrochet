export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-sm text-gray-600">{message}</div>
      </div>
    </div>
  );
}