import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MemoizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const MemoizedCard = memo<MemoizedCardProps>(({
  title,
  children,
  className,
  headerClassName,
  contentClassName
}) => {
  return (
    <Card className={cn('glass-card border-white/10', className)}>
      {title && (
        <CardHeader className={headerClassName}>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard';
