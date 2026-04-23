'use client';
import { Lock, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuspensionPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            SERVICIO SUSPENDIDO
          </CardTitle>
          <CardDescription className="text-red-600">
            Esta liga no ha realizado su pago de suscripción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700 text-center">
              Para reactivar el servicio, por favor contacta a nuestro equipo de soporte.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = 'mailto:soporte@ligamaster.com'}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contactar por Email
            </Button>
            
            <Button 
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => window.location.href = 'tel:+1234567890'}
            >
              <Phone className="w-4 h-4 mr-2" />
              Llamar a Soporte
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Referencia: SUS-LIGA2024</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
