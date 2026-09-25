export default function Loading() {
  return (
    <div className="p-4 flex flex-col lg:flex-row gap-5 container mx-auto max-w-250">
      <div className="w-full">
        <div className="h-70 w-full animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-8 w-full animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-6 w-full animate-pulse rounded bg-gray-200" />
        <div className="flex flex-row gap-4 mt-2">
          <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-4 h-8 w-full animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
          {[...Array(8)].map((_, index) => (
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>

      <div className="w-100 hidden lg:block">
        <div className="h-80 w-full animate-pulse rounded bg-gray-200" />
      </div>
      
    </div>
  )
}