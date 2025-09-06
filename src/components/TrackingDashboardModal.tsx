import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CursorTrackingDashboard } from '@/components/CursorTrackingDashboard';

interface TrackingDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId?: string;
}

export function TrackingDashboardModal({ isOpen, onClose, promptId }: TrackingDashboardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎬 Motion Design Cursor Tracking Dashboard
          </DialogTitle>
        </DialogHeader>
        <CursorTrackingDashboard promptId={promptId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}