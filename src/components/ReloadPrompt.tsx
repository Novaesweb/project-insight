import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function ReloadPrompt() {
  const location = useLocation();

  const {
    offlineReady: [offlineReady, setOfflineReady],
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
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (needRefresh) {
      // Registrar o toast apenas uma vez quando o estado de refresh for detectado
      toast('Nova atualização disponível!', {
        description: 'Clique no botão para carregar a versão mais recente e aproveitar as novas funcionalidades.',
        duration: Infinity,
        action: (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary text-white gap-2"
            onClick={() => updateServiceWorker(true)}
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

  useEffect(() => {
    if (offlineReady) {
      toast('App pronto para uso offline', {
        description: 'Você pode acessar o painel mesmo sem internet.',
      });
    }
  }, [offlineReady]);

  return null;
}
