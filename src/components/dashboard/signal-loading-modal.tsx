'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Lightbulb, 
  Target, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: 'SDR' | 'AE' | 'CSM';
}

const TIPS_BY_PERSONA = {
  SDR: [
    {
      icon: Target,
      title: "Focus on High-Intent Signals",
      description: "Prioritize prospects showing strong buying signals like job changes, funding rounds, or technology adoption.",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      icon: Clock,
      title: "Act Fast on High Urgency",
      description: "High urgency signals have a 3x higher conversion rate when contacted within the first hour.",
      color: "bg-red-50 text-red-700 border-red-200"
    },
    {
      icon: Users,
      title: "Target Mid-Market Companies",
      description: "Companies with 51-200 employees are in the sweet spot for growth and have budget flexibility.",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      icon: TrendingUp,
      title: "Use Hiring Signals",
      description: "New hires often bring fresh perspectives and may be looking to implement new solutions.",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ],
  AE: [
    {
      icon: TrendingUp,
      title: "Track Funding Rounds",
      description: "Companies that recently raised funding have budget and are actively looking to scale operations.",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      icon: Users,
      title: "Target Decision Makers",
      description: "Focus on VP, Director, and C-Level executives who have budget authority and decision-making power.",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      icon: Target,
      title: "Enterprise Opportunities",
      description: "Companies with 201+ employees have larger budgets and longer sales cycles but higher deal values.",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      icon: Clock,
      title: "Timing is Everything",
      description: "Reach out within 48 hours of funding announcements for maximum impact.",
      color: "bg-orange-50 text-orange-700 border-orange-200"
    }
  ],
  CSM: [
    {
      icon: Users,
      title: "Monitor Job Changes",
      description: "Key contact changes can indicate new priorities or budget reallocation opportunities.",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      icon: TrendingUp,
      title: "Tech Adoption Signals",
      description: "Companies adopting new technologies may need additional support or complementary solutions.",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      icon: Target,
      title: "Existing Customer Focus",
      description: "Your current customers are 5x more likely to buy additional products than new prospects.",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      icon: CheckCircle,
      title: "Proactive Outreach",
      description: "Reach out before they have problems to strengthen relationships and identify expansion opportunities.",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200"
    }
  ]
};

const LOADING_MESSAGES = [
  "Analyzing prospect data...",
  "Scanning for buying signals...",
  "Cross-referencing company information...",
  "Identifying high-value opportunities...",
  "Generating personalized insights...",
  "Finalizing signal recommendations..."
];

export function SignalLoadingModal({ isOpen, onClose, persona }: SignalLoadingModalProps) {
  const [currentTip, setCurrentTip] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  const tips = TIPS_BY_PERSONA[persona];

  useEffect(() => {
    if (!isOpen) return;

    // Reset state when modal opens
    setCurrentTip(0);
    setCurrentMessage(0);
    setProgress(0);

    // Rotate tips every 2 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 2000);

    // Rotate loading messages every 1.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(tipInterval);
          clearInterval(messageInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearInterval(tipInterval);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, tips.length]);

  if (!isOpen) return null;

  const currentTipData = tips[currentTip];
  const TipIcon = currentTipData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generating New Signal</h2>
              <p className="text-sm text-gray-600">Finding the best opportunities for your {persona} role</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {LOADING_MESSAGES[currentMessage]}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {persona} Pro Tips
            </h3>
            <Badge variant="outline" className="text-xs">
              Tip {currentTip + 1} of {tips.length}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg border transition-all duration-500",
              currentTipData.color
            )}>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <TipIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{currentTipData.title}</h4>
                  <p className="text-sm opacity-90">{currentTipData.description}</p>
                </div>
              </div>
            </div>

            {/* Tip Indicators */}
            <div className="flex justify-center space-x-2">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentTip ? "bg-blue-600 w-6" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              This usually takes 3-5 seconds...
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={progress < 100}
            >
              {progress < 100 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
