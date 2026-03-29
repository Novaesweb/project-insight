import React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "list" | "table" | "chart";
  count?: number;
}

export function LoadingSkeleton({ 
  className, 
  variant = "default", 
  count = 1 
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={cn("space-y-3", className)}>
      {variant === "default" && (
        <>
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </>
      )}
      
      {variant === "card" && (
        <div className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      
      {variant === "list" && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      )}
      
      {variant === "table" && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      )}
      
      {variant === "chart" && (
        <div className="space-y-4">
          <div className="flex items-end justify-between space-x-2">
            <Skeleton className="h-20 w-8" />
            <Skeleton className="h-32 w-8" />
            <Skeleton className="h-16 w-8" />
            <Skeleton className="h-24 w-8" />
            <Skeleton className="h-28 w-8" />
          </div>
          <div className="flex justify-between space-x-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      )}
    </div>
  ));

  return <div className="space-y-4">{skeletons}</div>;
}

export function PageLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <LoadingSkeleton variant="table" count={5} />
      </div>
    </div>
  );
}

export function SuspenseFallback({ 
  children, 
  fallback = <PageLoadingSkeleton /> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 z-50">
        {fallback}
      </div>
    </div>
  );
}
