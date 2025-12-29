'use client';

import { motion } from 'framer-motion';
import { AIAlert, riskLevelColors } from '@/lib/ai-mock-data';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface AlertCardProps {
  alert: AIAlert;
  onDismiss?: (alertId: string) => void;
}

const alertIcons = {
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  success: CheckCircle,
};

const alertStyles = {
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  danger: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
};

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const Icon = alertIcons[alert.type];
  const style = alertStyles[alert.type];
  const riskStyle = alert.riskLevel ? riskLevelColors[alert.riskLevel] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`${style.bg} border ${style.border} rounded-lg p-4 ${!alert.isRead ? 'shadow-lg' : 'opacity-75'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${style.bg}`}>
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className={`font-semibold ${style.text}`}>{alert.title}</h4>
            {onDismiss && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDismiss(alert.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
          <div className="flex items-center gap-3 text-xs">
            {alert.asset && (
              <span className="text-gray-400">
                Asset: <span className="text-white font-semibold">{alert.asset}</span>
              </span>
            )}
            {riskStyle && (
              <span className={`px-2 py-0.5 rounded ${riskStyle.bg} ${riskStyle.text} font-medium capitalize`}>
                {alert.riskLevel} Risk
              </span>
            )}
            <span className="text-gray-500 ml-auto">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
