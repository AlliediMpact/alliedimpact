'use client';

import { PaymentMethod, paymentMethodIcons } from '@/lib/p2p-mock-data';

interface PaymentMethodTagProps {
  method: PaymentMethod;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function PaymentMethodTag({ method, size = 'md' }: PaymentMethodTagProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 bg-[#1E293B] rounded-full text-gray-300 ${sizeClasses[size]}`}>
      <span>{paymentMethodIcons[method]}</span>
      <span>{method}</span>
    </span>
  );
}
