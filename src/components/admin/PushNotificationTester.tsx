import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  isPushSupported, 
  getPushPermission, 
  isSubscribed, 
  subscribeToPush, 
  unsubscribeFromPush, 
  sendTestNotification,
  type PushTestResult 
} from '@/lib/push-notifications';
import { Bell, BellOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function PushNotificationTester() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<PushTestResult | null>(null);

  useEffect(() => {
    async function checkStatus() {
      const isSupported = await isPushSupported();
      const currentPermission = await getPushPermission();
      const isSubscribedToPush = await isSubscribed();
      
      setSupported(isSupported);
      setPermission(currentPermission);
      setSubscribed(isSubscribedToPush);
    }
    
    checkStatus();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const success = await subscribeToPush('admin', 'admin-user');
      if (success) {
        setSubscribed(true);
        setPermission('granted');
        setTestResult(null);
      }
    } catch (error) {
      console.error('Erro ao se inscrever:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setSubscribed(false);
        setPermission('default');
        setTestResult(null);
      }
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      const result = await sendTestNotification();
      setTestResult(result);
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      setTestResult({
        ok: false,
        sent: 0,
        total: 0,
        message: 'Erro ao enviar notificação de teste'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!supported) {
      return <Badge variant="destructive">Não Suportado</Badge>;
    }
    
    switch (permission) {
      case 'granted':
        return subscribed ? (
          <Badge variant="default" className="bg-green-500">Inscrito</Badge>
        ) : (
          <Badge variant="secondary">Permitido (não inscrito)</Badge>
        );
      case 'denied':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">Não solicitado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications - Teste
          </CardTitle>
          <CardDescription>
            Teste as notificações push nativas do NovaesWeb
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge()}
          </div>

          {/* Informações de Suporte */}
          {!supported && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Seu navegador não suporta notificações push. Use Chrome, Firefox ou Edge.
              </AlertDescription>
            </Alert>
          )}

          {/* Permissão Bloqueada */}
          {supported && permission === 'denied' && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                As notificações estão bloqueadas. Habilite nas configurações do navegador.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          {supported && permission !== 'denied' && (
            <div className="flex gap-2">
              {!subscribed ? (
                <Button 
                  onClick={handleSubscribe} 
                  disabled={loading || permission === 'denied'}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                  Ativar Notificações
                </Button>
              ) : (
                <Button 
                  onClick={handleUnsubscribe} 
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
                  Desativar Notificações
                </Button>
              )}

              {subscribed && (
                <Button 
                  onClick={handleTestNotification} 
                  disabled={loading}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Enviar Teste
                </Button>
              )}
            </div>
          )}

          {/* Resultado do Teste */}
          {testResult && (
            <Alert className={testResult.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {testResult.ok ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription className={testResult.ok ? 'text-green-800' : 'text-red-800'}>
                <div className="space-y-2">
                  <p className="font-medium">
                    {testResult.ok ? '✅ Sucesso!' : '❌ Falhou'}
                  </p>
                  <p className="text-sm">
                    {testResult.message}
                  </p>
                  {testResult.sent > 0 && (
                    <p className="text-sm">
                      Enviadas: {testResult.sent}/{testResult.total}
                    </p>
                  )}
                  {testResult.errors && testResult.errors.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium">Erros:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {testResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Informações Adicionais */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• As notificações funcionam mesmo com o navegador fechado</p>
            <p>• Você receberá notificações de novas mensagens e atualizações</p>
            <p>• As notificações podem ser desativadas a qualquer momento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
