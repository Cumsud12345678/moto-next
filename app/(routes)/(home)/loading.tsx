export default function Loading() {
  return (
    <div className="p-3 flex flex-col gap-5 mt-14 container mx-auto max-w-250">
      <div>
        <div className="flex gap-3">
          <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex whitespace-nowrap scrollbar-none overflow-auto gap-2 mt-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-12 w-50 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div className="">
              <div className="h-40 w-full animate-pulse rounded-t-lg bg-gray-200" />
              <div className="mt-2 h-6 w-20 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-6 w-40 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}