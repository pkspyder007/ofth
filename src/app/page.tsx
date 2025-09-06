import { SignalDashboard } from '@/components/dashboard/signal-dashboard';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <SignalDashboard />
      </div>
      <Toaster />
    </div>
  );
}