'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTransactionFeed } from '@/hooks/use-websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { formatCurrency } from '@/lib/membership-tiers';
import { EmptyTransactions } from '@/components/ui/empty-state';
import { SkeletonTransactionList } from '@/components/ui/skeleton-card';

export function LiveTransactionFeed() {
  const { transactions, stats, isConnected } = useTransactionFeed();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </>
          )}
        </Badge>
        {isConnected && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-green-500"
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                key={stats.totalVolume}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                {formatCurrency(stats.totalVolume)}
              </motion.div>
              <p className="text-xs text-muted-foreground">Total platform volume</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                key={stats.activeUsers}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                {stats.activeUsers}
              </motion.div>
              <p className="text-xs text-muted-foreground">Users online now</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                key={stats.completedToday}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                {stats.completedToday}
              </motion.div>
              <p className="text-xs text-muted-foreground">Transactions today</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Live Transaction Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Transaction Feed</CardTitle>
          <CardDescription>Real-time platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {!isConnected ? (
              <SkeletonTransactionList />
            ) : transactions.length === 0 ? (
              <EmptyTransactions />
            ) : (
              <AnimatePresence mode="popLayout">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'invest'
                            ? 'bg-green-100 dark:bg-green-900/20'
                            : 'bg-blue-100 dark:bg-blue-900/20'
                        }`}
                      >
                        {transaction.type === 'invest' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.type === 'invest' ? 'Investment' : 'Loan'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.userName} • {new Date(transaction.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
