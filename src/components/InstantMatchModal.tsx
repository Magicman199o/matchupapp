import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Zap, Clock, Heart } from 'lucide-react';

interface InstantMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasMatch: boolean;
  matchName?: string;
  onViewMatch?: () => void;
}

export function InstantMatchModal({ 
  isOpen, 
  onClose, 
  hasMatch, 
  matchName,
  onViewMatch 
}: InstantMatchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              {hasMatch ? (
                <Heart className="w-8 h-8 text-primary animate-heart" />
              ) : (
                <Clock className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center">
            {hasMatch ? '🎉 Instant Match Found!' : 'No Instant Match Available'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {hasMatch ? (
              <>
                Great news! You've been instantly matched with{' '}
                <span className="font-semibold text-primary">{matchName}</span>!
              </>
            ) : (
              'There are no available matches in your group right now. You will be matched as soon as there is a suitable user available for you!'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          {hasMatch ? (
            <Button variant="hero" onClick={onViewMatch}>
              <Heart className="w-4 h-4 mr-2" />
              View My Match
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Got it
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}