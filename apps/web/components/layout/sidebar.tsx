'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/lib/navigation';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-background h-screen',
        collapsed ? 'w-16' : 'w-64',
        'transition-all duration-300 ease-in-out',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-4 flex-shrink-0">
        <Link href="/" className="flex items-center space-x-2 w-full">
          <span className="text-xl font-bold whitespace-nowrap overflow-hidden">
            {collapsed ? 'VB' : 'VayBooks'}
          </span>
        </Link>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-20 z-10 rounded-full border bg-background hover:bg-accent p-1 transition-colors"
        aria-label="Toggle sidebar"
      >
        <span className="text-sm">{collapsed ? '→' : '←'}</span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <div key={item.title}>
            <Link
              href={item.href}
              onClick={(e) => {
                if (item.children) {
                  e.preventDefault();
                  toggleExpanded(item.title);
                }
              }}
              className={cn(
                'w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                'text-foreground hover:bg-accent hover:text-accent-foreground',
                isActive(item.href) && 'bg-accent text-accent-foreground',
              )}
            >
              <span className="mr-3 text-lg flex-shrink-0">
                {/* Icon placeholder - replace with actual icons */}
                {item.icon === 'dashboard' && '📊'}
                {item.icon === 'users' && '👥'}
                {item.icon === 'package' && '📦'}
                {item.icon === 'shopping-cart' && '🛒'}
                {item.icon === 'shopping-bag' && '🛍️'}
                {item.icon === 'box' && '📦'}
                {item.icon === 'bar-chart' && '📈'}
                {item.icon === 'settings' && '⚙️'}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-foreground">{item.title}</span>
                  {item.children && (
                    <span className="flex-shrink-0 ml-2 text-foreground">{expandedItems.includes(item.title) ? '▼' : '▶'}</span>
                  )}
                </>
              )}
            </Link>

            {/* Child Items */}
            {!collapsed && item.children && expandedItems.includes(item.title) && (
              <div className="ml-9 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm transition-colors',
                      'text-foreground hover:bg-accent hover:text-accent-foreground',
                      isActive(child.href) && 'bg-accent text-accent-foreground'
                    )}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 flex-shrink-0">
        <div className={cn('text-xs text-muted-foreground', collapsed && 'text-center')}>
          {collapsed ? 'v1.0' : 'Version 1.0.0'}
        </div>
      </div>
    </div>
  );
}
