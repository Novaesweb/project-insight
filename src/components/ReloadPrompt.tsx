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
    // Só mostrar aviso se estiver em uma rota de painel (Admin, Cliente ou Revenda)
    const isPanelRoute = 
      location.pathname.startsWith('/admin') || 
      location.pathname.startsWith('/cliente') || 
      location.pathname.startsWith('/revenda');

    if (needRefresh && isPanelRoute) {
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
  }, [needRefresh, updateServiceWorker, location.pathname]);

  useEffect(() => {
    // Offline ready também apenas para painéis
    const isPanelRoute = 
      location.pathname.startsWith('/admin') || 
      location.pathname.startsWith('/cliente') || 
      location.pathname.startsWith('/revenda');

    if (offlineReady && isPanelRoute) {
      toast('App pronto para uso offline', {
        description: 'Você pode acessar o painel mesmo sem internet.',
      });
    }
  }, [offlineReady, location.pathname]);

  return null;
}
