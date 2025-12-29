'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

// Swipeable card
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, opacity, rotate }}
      className={cn('cursor-grab active:cursor-grabbing', className)}
      whileTap={{ scale: 1.05 }}
    >
      {children}
    </motion.div>
  );
}

// Bottom sheet
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage heights
  title?: string;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [50, 90],
  title,
  className,
}: BottomSheetProps) {
  const [snapPoint, setSnapPoint] = useState(snapPoints[0]);
  const y = useMotionValue(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    } else {
      // Snap to nearest point
      const currentHeight = ((100 - snapPoint) / 100) * window.innerHeight;
      const draggedHeight = currentHeight + info.offset.y;
      const heightPercentage = 100 - (draggedHeight / window.innerHeight) * 100;

      const nearest = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - heightPercentage) < Math.abs(prev - heightPercentage) ? curr : prev
      );

      setSnapPoint(nearest);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
        initial={{ y: '100%' }}
        animate={{ y: `${100 - snapPoint}%` }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl',
          className
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[80vh] p-6">{children}</div>
      </motion.div>
    </>
  );
}

// Pull to refresh
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const rotate = useTransform(y, [0, threshold], [0, 360]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Refresh indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-0 right-0 flex justify-center py-4 pointer-events-none"
      >
        <motion.div
          style={{ rotate }}
          className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className={isRefreshing ? 'pointer-events-none' : ''}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Mobile drawer
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  side = 'left',
  className,
}: MobileDrawerProps) {
  const x = useMotionValue(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (side === 'left' && info.offset.x < -threshold) {
      onClose();
    } else if (side === 'right' && info.offset.x > threshold) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        drag="x"
        dragConstraints={{ left: side === 'left' ? 0 : undefined, right: side === 'right' ? 0 : undefined }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        initial={{ x: side === 'left' ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: side === 'left' ? '-100%' : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          'fixed top-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl',
          side === 'left' ? 'left-0' : 'right-0',
          className
        )}
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </motion.div>
    </>
  );
}

// Accordion for mobile
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

export function MobileAccordion({ title, children, icon, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-purple-600">{icon}</div>}
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-0">{children}</div>
      </motion.div>
    </div>
  );
}

// Touch-friendly tabs
interface MobileTabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({ tabs, activeTab, onChange, className }: MobileTabsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide', className)}>
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors',
            activeTab === tab.id
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab.icon}
          <span className="text-sm font-medium">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// Floating action menu
interface FABMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface FloatingActionMenuProps {
  items: FABMenuItem[];
  className?: string;
}

export function FloatingActionMenu({ items, className }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {/* Menu items */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-16 right-0 space-y-2"
        >
          {items.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {item.label}
              </span>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600">
                {item.icon}
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <X size={24} />
      </motion.button>
    </div>
  );
}

// Responsive container with safe areas
interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeAreaContainer({ children, className }: SafeAreaContainerProps) {
  return (
    <div
      className={cn('px-4 pb-safe-area-bottom pt-safe-area-top', className)}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        paddingTop: 'max(env(safe-area-inset-top), 1rem)',
      }}
    >
      {children}
    </div>
  );
}
