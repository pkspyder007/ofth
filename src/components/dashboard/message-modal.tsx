'use client';

import { useState, useEffect } from 'react';
import { Signal } from '@/types/signal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Send, 
  Building2, 
  MessageSquare,
  Sparkles,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSignals: Signal[];
  persona: 'SDR' | 'AE' | 'CSM';
}

const MESSAGE_TEMPLATES = {
  SDR: [
    {
      id: 'cold-outreach',
      title: 'Cold Outreach',
      subject: 'Quick question about {{company}}',
      body: `Hi {{prospectName}},

I noticed {{company}} recently {{signalContext}}. I help companies like yours {{valueProposition}}.

Would you be open to a brief 15-minute conversation this week to explore how we might help {{company}} achieve similar results?

Best regards,
[Your Name]`
    },
    {
      id: 'hiring-signal',
      title: 'Hiring Signal',
      subject: 'Congratulations on the growth at {{company}}',
      body: `Hi {{prospectName}},

Congratulations on the recent hiring at {{company}}! It's exciting to see companies investing in their teams.

I work with {{companySize}} companies to help them {{valueProposition}} during growth phases. Given your recent expansion, I thought you might be interested in learning how we've helped similar companies.

Would you be available for a quick call this week?

Best,
[Your Name]`
    }
  ],
  AE: [
    {
      id: 'funding-congratulations',
      title: 'Funding Congratulations',
      subject: 'Congratulations on {{company}}\'s recent funding round',
      body: `Hi {{prospectName}},

Congratulations on {{company}}\'s recent funding round! This is an exciting time for growth and scaling.

I work with companies in similar stages to help them {{valueProposition}}. Given your recent funding, I thought you might be interested in learning how we've helped other funded companies accelerate their growth.

Would you be open to a brief conversation about how we might support {{company}}\'s next phase of growth?

Best regards,
[Your Name]`
    },
    {
      id: 'enterprise-outreach',
      title: 'Enterprise Outreach',
      subject: 'Scaling {{company}}\'s operations',
      body: `Hi {{prospectName}},

I noticed {{company}} has grown significantly and is now in the {{companySize}} range. This is often when companies need to {{valueProposition}}.

I work with enterprise companies to help them {{valueProposition}}. Given {{company}}\'s size and growth trajectory, I thought you might be interested in learning about our enterprise solutions.

Would you be available for a strategic discussion this week?

Best,
[Your Name]`
    }
  ],
  CSM: [
    {
      id: 'job-change-follow-up',
      title: 'Job Change Follow-up',
      subject: 'Congratulations on your new role at {{company}}',
      body: `Hi {{prospectName}},

Congratulations on your new role at {{company}}! I hope you're settling in well.

As your Customer Success Manager, I wanted to reach out to ensure you have everything you need to be successful in your new position. I'm here to help you get up to speed with our platform and answer any questions you might have.

Would you be available for a brief onboarding call this week?

Best regards,
[Your Name]`
    },
    {
      id: 'tech-adoption-support',
      title: 'Tech Adoption Support',
      subject: 'Supporting {{company}}\'s technology adoption',
      body: `Hi {{prospectName}},

I noticed {{company}} is adopting new technologies. This is a great time to ensure you're getting maximum value from our platform.

I'd love to schedule a strategic review to discuss how we can better support {{company}}\'s technology initiatives and ensure you're leveraging all available features.

Are you available for a 30-minute strategic session this week?

Best,
[Your Name]`
    }
  ]
};

const VALUE_PROPOSITIONS = {
  SDR: 'streamline their sales processes and increase conversion rates',
  AE: 'scale their operations efficiently and drive revenue growth',
  CSM: 'maximize their platform investment and achieve better outcomes'
};

export function MessageModal({ isOpen, onClose, selectedSignals, persona }: MessageModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [currentMessageStatus, setCurrentMessageStatus] = useState('');
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'pending' | 'sending' | 'sent' | 'error'>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const templates = MESSAGE_TEMPLATES[persona];
  const valueProposition = VALUE_PROPOSITIONS[persona];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate('');
      setSubject('');
      setBody('');
      setSendProgress(0);
      setSentCount(0);
      setCurrentMessageStatus('');
      setMessageStatuses({});
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Update message when template changes
  useEffect(() => {
    if (selectedTemplate && selectedSignals.length > 0) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        // Replace placeholders with actual data
        const firstSignal = selectedSignals[0];
        const company = firstSignal?.company || '{{company}}';
        const prospectName = firstSignal?.prospectName || '{{prospectName}}';
        const companySize = firstSignal?.companySize || '{{companySize}}';
        
        const processedSubject = template.subject
          .replace('{{company}}', company)
          .replace('{{prospectName}}', prospectName)
          .replace('{{companySize}}', companySize);
        
        const processedBody = template.body
          .replace(/{{company}}/g, company)
          .replace(/{{prospectName}}/g, prospectName)
          .replace(/{{companySize}}/g, companySize)
          .replace(/{{valueProposition}}/g, valueProposition)
          .replace(/{{signalContext}}/g, getSignalContext(firstSignal));

        setSubject(processedSubject);
        setBody(processedBody);
      }
    }
  }, [selectedTemplate, selectedSignals, templates, valueProposition]);

  const getSignalContext = (signal: Signal | undefined) => {
    if (!signal) return 'made recent changes';
    
    switch (signal.signalType) {
      case 'hiring':
        return 'announced new hiring';
      case 'funding':
        return 'secured new funding';
      case 'job_change':
        return 'had key personnel changes';
      case 'tech_adoption':
        return 'adopted new technologies';
      case 'intent':
        return 'showed buying intent';
      default:
        return 'made recent changes';
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    setSendProgress(0);
    setSentCount(0);
    setCurrentMessageStatus('Preparing messages...');

    // Initialize all messages as pending
    const initialStatuses: Record<string, 'pending'> = {};
    selectedSignals.forEach(signal => {
      initialStatuses[signal.id] = 'pending';
    });
    setMessageStatuses(initialStatuses);

    // Simulate sending messages with progress and engaging feedback
    for (let i = 0; i < selectedSignals.length; i++) {
      const signal = selectedSignals[i];
      
      // Update current message status
      setCurrentMessageStatus(`Sending to ${signal.prospectName} at ${signal.company}...`);
      
      // Mark as sending
      setMessageStatuses(prev => ({
        ...prev,
        [signal.id]: 'sending'
      }));
      
      // Simulate different sending times based on signal urgency
      const baseDelay = signal.urgency === 'high' ? 800 : 1200;
      const randomDelay = Math.random() * 600;
      await new Promise(resolve => setTimeout(resolve, baseDelay + randomDelay));
      
      // Mark as sent
      setMessageStatuses(prev => ({
        ...prev,
        [signal.id]: 'sent'
      }));
      
      setSendProgress(((i + 1) / selectedSignals.length) * 100);
      setSentCount(i + 1);
    }

    // Show completion status
    setCurrentMessageStatus('All messages sent successfully! 🎉');
    
    // Mark signals as processed
    console.log('Messages sent to:', selectedSignals.map(s => s.prospectName));

    // Show success state for a moment before closing
    setShowSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSending(false);
    
    // Close modal after showing success
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const getPersonaColor = () => {
    switch (persona) {
      case 'SDR': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'AE': return 'bg-green-50 text-green-700 border-green-200';
      case 'CSM': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen || selectedSignals.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className={cn("p-3 rounded-lg border", getPersonaColor())}>
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Send Messages</h2>
              <p className="text-gray-600">
                Sending to {selectedSignals.length} prospect{selectedSignals.length !== 1 ? 's' : ''} as {persona}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Recipients */}
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipients</h3>
              <div className="space-y-3">
                {selectedSignals.map((signal) => {
                  const status = messageStatuses[signal.id] || 'pending';
                  const getStatusIcon = () => {
                    switch (status) {
                      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
                      case 'sending': return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
                      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
                      case 'error': return <X className="h-4 w-4 text-red-500" />;
                      default: return <Clock className="h-4 w-4 text-gray-400" />;
                    }
                  };

                  const getStatusColor = () => {
                    switch (status) {
                      case 'pending': return 'border-gray-200';
                      case 'sending': return 'border-blue-200 bg-blue-50';
                      case 'sent': return 'border-green-200 bg-green-50';
                      case 'error': return 'border-red-200 bg-red-50';
                      default: return 'border-gray-200';
                    }
                  };

                  return (
                    <div key={signal.id} className={cn("bg-white p-3 rounded-lg border transition-all duration-300", getStatusColor())}>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {signal.prospectName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {signal.prospectName}
                            </p>
                            {signal.isNew && (
                              <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                                <Sparkles className="h-3 w-3 mr-1" />
                                New
                              </Badge>
                            )}
                            <div className="ml-auto">
                              {getStatusIcon()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{signal.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500 truncate">{signal.company}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {signal.signalType}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                signal.urgency === 'high' && "bg-red-100 text-red-800",
                                signal.urgency === 'medium' && "bg-yellow-100 text-yellow-800",
                                signal.urgency === 'low' && "bg-gray-100 text-gray-800"
                              )}
                            >
                              {signal.urgency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Message Composition */}
          <div className="flex-1 flex flex-col">
            {/* Template Selection */}
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Message Template</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div>
                      <div className="font-medium">{template.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.subject}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Form */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject line..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter your message..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              {isSending ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-500 animate-pulse" />
                      <span className="text-sm font-medium text-gray-700">
                        {currentMessageStatus}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{Math.round(sendProgress)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${sendProgress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{sentCount} of {selectedSignals.length} messages sent</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>High engagement expected</span>
                    </div>
                  </div>
                </div>
              ) : showSuccess ? (
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-semibold text-green-700">
                      Messages Sent Successfully!
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    All {selectedSignals.length} messages have been delivered. You can expect responses within 24-48 hours.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{selectedSignals.length} prospects reached</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>High priority signals prioritized</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Ready to send to {selectedSignals.length} prospect{selectedSignals.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSend}
                      disabled={!subject.trim() || !body.trim()}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send Messages</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
