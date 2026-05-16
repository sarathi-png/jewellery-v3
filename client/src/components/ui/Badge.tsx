import { cn } from '@/lib/utils';

interface BadgeProps {
  children: string;
  variant?: 'default' | 'gold' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:animate-pulse hover:scale-[1.05] transition-transform duration-200',
        {
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': variant === 'default',
          'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300': variant === 'gold',
          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': variant === 'success',
          'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': variant === 'danger',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': variant === 'warning',
          'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
