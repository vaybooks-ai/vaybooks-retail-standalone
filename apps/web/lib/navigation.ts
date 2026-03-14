export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  description?: string;
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    description: 'Overview and analytics',
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: 'users',
    description: 'Manage customers',
  },
  {
    title: 'Products',
    href: '/products',
    icon: 'package',
    description: 'Product catalog',
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: 'shopping-cart',
    description: 'Sales and invoices',
    children: [
      { title: 'Invoices', href: '/sales/invoices' },
      { title: 'Quotations', href: '/sales/quotations' },
      { title: 'Returns', href: '/sales/returns' },
    ],
  },
  {
    title: 'Purchases',
    href: '/purchases',
    icon: 'shopping-bag',
    description: 'Purchase orders',
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: 'box',
    description: 'Stock management',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: 'bar-chart',
    description: 'Business reports',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings',
    description: 'Application settings',
  },
];
