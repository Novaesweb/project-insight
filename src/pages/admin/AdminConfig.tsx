import { useState } from 'react';
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PushNotificationTester } from "@/components/admin/PushNotificationTester";
import { DemoSiteManager } from "@/components/admin/DemoSiteManager";
import { WhatsAppConfig } from "@/components/admin/WhatsAppConfig";
import { Bell, Database, Globe, Eye, MessageCircle } from "lucide-react";

export default function AdminConfig() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>

        <Tabs defaultValue="demos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demos" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Demos
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Sites de Demonstração
                </CardTitle>
                <CardDescription>
                  Gerencie os sites que aparecem no portfólio público da NovaesWeb
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DemoSiteManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Flutuante
                </CardTitle>
                <CardDescription>
                  Configure o número que aparece no botão flutuante do site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhatsAppConfig />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Configure e teste as notificações push nativas do NovaesWeb
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PushNotificationTester />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Configurações gerais da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configurações gerais em desenvolvimento...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
