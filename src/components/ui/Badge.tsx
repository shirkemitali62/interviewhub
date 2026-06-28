import { clsx } from 'clsx'

interface BadgeProps {
  label: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
}

export function Badge({ label, color = 'blue' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300': color === 'blue',
        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': color === 'green',
        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': color === 'red',
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': color === 'yellow',
        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300': color === 'purple',
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': color === 'gray',
      }
    )}>
      {label}
    </span>
  )
}