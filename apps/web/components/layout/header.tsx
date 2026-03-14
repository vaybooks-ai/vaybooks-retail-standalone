'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  className?: string;
}

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/products': 'Products',
  '/sales': 'Sales',
  '/sales/invoices': 'Invoices',
  '/sales/quotations': 'Quotations',
  '/sales/returns': 'Returns',
  '/purchases': 'Purchases',
  '/inventory': 'Inventory',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getPageTitle = () => {
    if (!mounted) return 'Dashboard';
    return pageNames[pathname] || 'Dashboard';
  };

  return (
    <header className={cn('flex h-16 items-center border-b bg-background px-6', className)}>
      <div className="flex flex-1 items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            🔔
          </Button>
          <Button variant="ghost" size="icon">
            👤
          </Button>
        </div>
      </div>
    </header>
  );
}
