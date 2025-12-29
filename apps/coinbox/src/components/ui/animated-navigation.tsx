'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { slideInLeft, fadeIn, staggerContainer } from '@/lib/animations';
import { Menu, X, ChevronDown, Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

interface AnimatedNavProps {
  items: NavItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function AnimatedNav({ items, logo, actions, className }: AnimatedNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <motion.nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg'
          : 'bg-white dark:bg-gray-900',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {logo}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <NavMenuItem key={item.href} item={item} />
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {actions}
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            exit="exit"
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {items.map((item) => (
                <MobileNavItem key={item.href} item={item} />
              ))}
              {actions && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavMenuItem({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setIsOpen(true)}
      onMouseLeave={() => hasChildren && setIsOpen(false)}
    >
      <Link href={item.href}>
        <motion.div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative',
            isActive
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <motion.span
              className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {item.badge}
            </motion.span>
          )}
          {hasChildren && <ChevronDown size={16} />}
          
          {isActive && (
            <motion.div
              layoutId="navbar-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </motion.div>
      </Link>

      {/* Dropdown menu */}
      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute top-full left-0 mt-2 w-56 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          >
            {item.children!.map((child) => (
              <Link key={child.href} href={child.href}>
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  {child.icon}
                  <span>{child.label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavItem({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <motion.div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
          isActive
            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={item.href} className="flex items-center gap-3 flex-1">
          {item.icon}
          <span className="font-medium">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
        {hasChildren && (
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={20} />
          </motion.div>
        )}
      </motion.div>

      {/* Mobile submenu */}
      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-4 mt-2 space-y-1"
          >
            {item.children!.map((child) => (
              <Link key={child.href} href={child.href}>
                <motion.div
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  whileTap={{ scale: 0.98 }}
                >
                  {child.icon}
                  <span>{child.label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sidebar navigation
interface SidebarProps {
  items: NavItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export function AnimatedSidebar({ items, collapsed = false, onCollapse, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      className={cn(
        'h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
      animate={{ width: collapsed ? 80 : 256 }}
    >
      <div className="p-4">
        <motion.button
          onClick={() => onCollapse?.(!collapsed)}
          className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu />
        </motion.button>
      </div>

      <motion.nav
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="px-3 space-y-1"
      >
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative overflow-hidden',
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge !== undefined && item.badge > 0 && !collapsed && (
                  <motion.span
                    className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </motion.aside>
  );
}

// Breadcrumbs
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AnimatedBreadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <motion.nav
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={fadeIn} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href}>
              <motion.span
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {item.label}
              </motion.span>
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="text-gray-400">/</span>
          )}
        </motion.div>
      ))}
    </motion.nav>
  );
}
