'use client';

import { useSignalStore } from '@/store/signal-store';
import { Persona, PERSONA_OPTIONS } from '@/types/signal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Target, 
  Users, 
  Settings,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const personaIcons = {
  SDR: User,
  AE: Target,
  CSM: Users,
};

const personaColors = {
  SDR: 'bg-blue-100 text-blue-800 border-blue-200',
  AE: 'bg-green-100 text-green-800 border-green-200',
  CSM: 'bg-purple-100 text-purple-800 border-purple-200',
};

interface PersonaSwitcherProps {
  className?: string;
}

export function PersonaSwitcher({ className }: PersonaSwitcherProps) {
  const { 
    selectedPersona, 
    isPersonaMode, 
    setPersona, 
    togglePersonaMode 
  } = useSignalStore();

  const handlePersonaChange = (persona: Persona) => {
    setPersona(persona);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Persona Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Role-Based View</h3>
          <Button
            variant={isPersonaMode ? "default" : "outline"}
            size="sm"
            onClick={togglePersonaMode}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>{isPersonaMode ? 'Enabled' : 'Disabled'}</span>
          </Button>
        </div>
        {isPersonaMode && (
          <Badge 
            variant="outline" 
            className={cn(
              'border-2',
              personaColors[selectedPersona]
            )}
          >
            {selectedPersona} Mode Active
          </Badge>
        )}
      </div>

      {/* Persona Options */}
      {isPersonaMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-300">
          {PERSONA_OPTIONS.map((option) => {
            const Icon = personaIcons[option.value];
            const isSelected = selectedPersona === option.value;
            
            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  'h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-300 hover:scale-105',
                  isSelected && 'ring-2 ring-offset-2 scale-105',
                  isSelected && option.value === 'SDR' && 'ring-blue-500',
                  isSelected && option.value === 'AE' && 'ring-green-500',
                  isSelected && option.value === 'CSM' && 'ring-purple-500'
                )}
                onClick={() => handlePersonaChange(option.value)}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
                <div className="text-center">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
