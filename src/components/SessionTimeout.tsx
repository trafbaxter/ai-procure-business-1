import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateSession, refreshSession } from '@/utils/sessionManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const SessionTimeout: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const session = validateSession();
      if (!session) {
        logout();
        return;
      }

      const now = Date.now();
      const remaining = session.expiresAt - now;
      const minutes = Math.floor(remaining / (1000 * 60));

      if (minutes <= 5 && minutes > 0) {
        setTimeLeft(minutes);
        setShowWarning(true);
      } else if (minutes <= 0) {
        logout();
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every minute
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  const handleExtendSession = () => {
    if (refreshSession()) {
      setShowWarning(false);
      setTimeLeft(null);
    }
  };

  if (!showWarning || !isAuthenticated) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Session expires in {timeLeft} minute{timeLeft !== 1 ? 's' : ''}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExtendSession}
            className="ml-2"
          >
            Extend
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SessionTimeout;