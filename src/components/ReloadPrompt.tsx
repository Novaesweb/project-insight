import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function ReloadPrompt() {
  const isToastShown = useRef(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Simular registro do SW para build
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW Registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration error', error);
        });
    }
  }, []);

  const handleUpdate = useCallback(() => {
    setNeedRefresh(false);
    if (updateServiceWorker) {
      updateServiceWorker(true);
    } else {
      window.location.reload();
    }
  }, [updateServiceWorker]);

  const handleSkip = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  useEffect(() => {
    if (needRefresh && !isToastShown.current) {
      isToastShown.current = true;
      toast({
        title: 'Atualização Disponível',
        description: 'Uma nova versão do aplicativo está disponível.',
        action: (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleUpdate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Agora
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Depois
            </Button>
          </div>
        ),
        duration: Infinity,
      });
    }
  }, [needRefresh, handleUpdate, handleSkip]);

  return null;
}
