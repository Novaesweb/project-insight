import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function ReloadPrompt() {
  const isToastShown = useRef(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
    isToastShown.current = false;
  };

  useEffect(() => {
    if (needRefresh && !isToastShown.current) {
      isToastShown.current = true;
      
      toast('Nova atualização disponível!', {
        description: 'O painel foi atualizado com melhorias de segurança e performance.',
        duration: Infinity,
        action: (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary text-white gap-2"
            onClick={() => {
              updateServiceWorker(true);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar Agora
          </Button>
        ),
        cancel: (
          <Button variant="ghost" size="sm" onClick={() => close()}>
            Depois
          </Button>
        ),
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}


