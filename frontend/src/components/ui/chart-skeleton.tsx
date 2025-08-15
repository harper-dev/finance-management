import { Skeleton } from "./skeleton"

interface ChartSkeletonProps {
  height?: string
  showLegend?: boolean
  showTitle?: boolean
  className?: string
}

const ChartSkeleton = ({ 
  height = "h-64", 
  showLegend = true, 
  showTitle = true,
  className 
}: ChartSkeletonProps) => {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {showTitle && (
        <Skeleton className="h-6 w-48" />
      )}
      
      <div className={`w-full ${height} relative`}>
        {/* Chart area */}
        <Skeleton className="w-full h-full rounded-lg" />
        
        {/* Simulated chart bars/lines */}
        <div className="absolute inset-4 flex items-end justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="w-8 bg-muted-foreground/20" 
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>
      
      {showLegend && (
        <div className="flex gap-4 justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { ChartSkeleton }