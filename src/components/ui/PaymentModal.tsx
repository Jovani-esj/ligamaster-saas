import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  monto: number;
  concepto: string;
}

export function PaymentModal({ isOpen, onClose, onSuccess, monto, concepto }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    numero: '',
    expiracion: '',
    cvc: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Basic formatting for demo purposes
    let formattedValue = value;
    if (name === 'numero') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
    } else if (name === 'expiracion') {
      formattedValue = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').substring(0, 5);
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || formData.numero.length < 19 || formData.expiracion.length < 5 || formData.cvc.length < 3) {
      toast.error('Por favor completa todos los datos de la tarjeta correctamente.');
      return;
    }

    setIsProcessing(true);
    
    // Simular el tiempo de procesamiento de una pasarela de pago (ej. Stripe)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    toast.success('Pago procesado exitosamente.');
    
    // Esperar un momento para mostrar el mensaje de éxito antes de cerrar
    setTimeout(() => {
      onSuccess();
      // Reset state for future uses
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ nombre: '', numero: '', expiracion: '', cvc: '' });
      }, 500);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !isSuccess && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pago Seguro
          </DialogTitle>
          <DialogDescription>
            Simulador de pasarela de pago
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">¡Pago Exitoso!</h3>
            <p className="text-gray-500">El pago por {concepto} se ha procesado correctamente.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border">
              <div>
                <p className="text-sm text-gray-500 font-medium">Concepto</p>
                <p className="font-semibold text-gray-900">{concepto}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Total a pagar</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre en la tarjeta</Label>
                <Input 
                  id="nombre" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: JUAN PEREZ" 
                  disabled={isProcessing}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número de tarjeta</Label>
                <div className="relative">
                  <Input 
                    id="numero" 
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    placeholder="0000 0000 0000 0000" 
                    className="pl-10 font-mono"
                    disabled={isProcessing}
                    required 
                  />
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiracion">Fecha de Exp. (MM/AA)</Label>
                  <Input 
                    id="expiracion" 
                    name="expiracion"
                    value={formData.expiracion}
                    onChange={handleInputChange}
                    placeholder="MM/AA" 
                    disabled={isProcessing}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input 
                    id="cvc" 
                    name="cvc"
                    type="password"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="123" 
                    maxLength={4}
                    disabled={isProcessing}
                    required 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pagar ${monto.toLocaleString('es-MX')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
