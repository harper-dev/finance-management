import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
  children: React.ReactNode
}

const LoadingOverlay = ({ 
  isLoading, 
  message = "Loading...", 
  className,
  children 
}: LoadingOverlayProps) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export { LoadingOverlay }