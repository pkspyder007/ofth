'use client';

import { useSignalStore } from '@/store/signal-store';
import { PERSONA_FILTERS } from '@/types/signal';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface PersonaSummaryProps {
  className?: string;
}

export function PersonaSummary({ className }: PersonaSummaryProps) {
  const { 
    selectedPersona, 
    isPersonaMode, 
    filteredSignals, 
    signals 
  } = useSignalStore();

  const summaryMetrics = useMemo(() => {
    if (!isPersonaMode || !signals || !filteredSignals) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySignals = filteredSignals.filter(signal => {
      const signalDate = new Date(signal.timestamp);
      signalDate.setHours(0, 0, 0, 0);
      return signalDate.getTime() === today.getTime();
    });

    switch (selectedPersona) {
      case 'SDR':
        const highUrgencyToday = todaySignals.filter(s => s.urgency === 'high').length;
        return {
          icon: AlertTriangle,
          color: 'bg-red-50 text-red-700 border-red-200',
          iconColor: 'text-red-500',
          title: 'High Urgency Signals Today',
          value: highUrgencyToday,
          subtitle: `${highUrgencyToday} signals requiring immediate attention`
        };

      case 'AE':
        const fundingSignals = filteredSignals.filter(s => s.signalType === 'funding');
        const recentFunding = fundingSignals.filter(s => {
          const signalDate = new Date(s.timestamp);
          const daysDiff = (today.getTime() - signalDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 30; // Last 30 days
        }).length;
        return {
          icon: DollarSign,
          color: 'bg-green-50 text-green-700 border-green-200',
          iconColor: 'text-green-500',
          title: 'Companies Raised Funding Recently',
          value: recentFunding,
          subtitle: `${recentFunding} companies with funding signals in last 30 days`
        };

      case 'CSM':
        const existingCustomers = filteredSignals.filter(s => 
          PERSONA_FILTERS.CSM.companyList?.includes(s.company)
        );
        const jobChangeSignals = existingCustomers.filter(s => 
          s.signalType === 'job_change'
        ).length;
        return {
          icon: Users,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          iconColor: 'text-purple-500',
          title: 'Existing Customers with Job Changes',
          value: jobChangeSignals,
          subtitle: `${jobChangeSignals} customers with job change signals`
        };

      default:
        return null;
    }
  }, [selectedPersona, isPersonaMode, filteredSignals, signals]);

  if (!isPersonaMode || !summaryMetrics) {
    return null;
  }

  const { icon: Icon, color, iconColor, title, value, subtitle } = summaryMetrics;

  return (
    <div className={cn('p-4 bg-white border rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300', className)}>
      <div className="flex items-center space-x-4">
        <div className={cn('p-3 rounded-lg border', color)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Badge variant="outline" className="text-sm">
              {selectedPersona} View
            </Badge>
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-600">{subtitle}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Filtered</div>
          <div className="text-2xl font-semibold text-gray-900">
            {filteredSignals.length.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
