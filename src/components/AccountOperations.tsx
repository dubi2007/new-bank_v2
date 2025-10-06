import React, { useState, useRef } from 'react'
import { Card } from 'primereact/card'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { Toast } from 'primereact/toast'
import { Avatar } from 'primereact/avatar'
import { BankService } from '../services/bankService'
import type { CuentaBancaria } from '../types'

interface AccountOperationsProps {
  type: 'deposit' | 'withdraw'
  user: CuentaBancaria
  onSuccess: () => void
  onBack: () => void
}

const AccountOperations: React.FC<AccountOperationsProps> = ({ type, user, onSuccess, onBack }) => {
  const toast = useRef<Toast>(null)
  const [amount, setAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const isDeposit = type === 'deposit'
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || amount <= 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Monto inválido',
        detail: 'El monto debe ser mayor a 0',
        life: 6000
      })
      return
    }

    if (!isDeposit && amount > user.sld_cta) {
      toast.current?.show({
        severity: 'error',
        summary: 'Saldo insuficiente',
        detail: `Tu saldo actual es ${formatCurrency(user.sld_cta)}`,
        life: 7000
      })
      return
    }

    setLoading(true)

    try {
      const success = isDeposit 
        ? await BankService.deposito(user.idn_tit, amount)
        : await BankService.retiro(user.idn_tit, amount)

      if (success) {
        toast.current?.show({
          severity: 'success',
          summary: `${isDeposit ? 'Depósito' : 'Retiro'} exitoso`,
          detail: `${isDeposit ? 'Depósito' : 'Retiro'} de ${formatCurrency(amount)} realizado correctamente`,
          life: 7000
        })
        setAmount(0)
        onSuccess()
        
        // Volver al home después de 2 segundos
        setTimeout(() => {
          onBack()
        }, 2000)
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error en operación',
          detail: `Error al realizar ${isDeposit ? 'el depósito' : 'el retiro'}`,
          life: 7000
        })
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de conexión',
        detail: 'No se pudo conectar al servidor. Intenta nuevamente.',
        life: 7000
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value)
  }

  const headerContent = (
    <div className={`relative text-center p-10 text-white rounded-t-xl overflow-hidden ${
      isDeposit 
        ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600'
        : 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600'
    }`}>
      {/* Efectos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <Avatar 
          icon={isDeposit ? "pi pi-plus-circle" : "pi pi-minus-circle"}
          size="xlarge"
          className="bg-white/30 text-white mb-4 shadow-2xl backdrop-blur-sm border-2 border-white/40 ring-4 ring-white/20 transform hover:scale-110 transition-transform duration-300"
        />
        <h1 className="text-4xl font-bold m-0 mb-2 tracking-tight drop-shadow-lg">
          {isDeposit ? 'DEPÓSITO' : 'RETIRO'}
        </h1>
        <p className="m-0 opacity-95 text-lg font-medium">
          {isDeposit ? 'Agregar dinero a tu cuenta' : 'Retirar dinero de tu cuenta'}
        </p>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <Card 
        header={headerContent}
        className="shadow-xl"
      >
        <div className="p-8">
          {/* Información de la cuenta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Número de Cuenta</div>
              <div className="font-mono font-bold text-gray-800 text-lg">{user.nro_cta}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Titular</div>
              <div className="font-bold text-gray-800 text-lg">{user.titular?.nom_tit} {user.titular?.fir_ape_tit}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Saldo Actual</div>
              <div className="font-bold text-emerald-600 text-xl">
                {formatCurrency(user.sld_cta)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border-2 border-gray-200 shadow-inner">
              <FloatLabel>
                <InputNumber
                  id="amount"
                  value={amount}
                  onValueChange={(e) => setAmount(e.value || 0)}
                  mode="currency"
                  currency="PEN"
                  locale="es-PE"
                  className="w-full text-center text-3xl font-bold"
                  min={0}
                  max={isDeposit ? 1000000 : user.sld_cta}
                  showButtons
                  step={10}
                />
                <label htmlFor="amount" className="font-semibold">
                  <i className={`pi ${isDeposit ? 'pi-plus-circle' : 'pi-minus-circle'} mr-2`}></i>
                  MONTO A {isDeposit ? 'DEPOSITAR' : 'RETIRAR'}
                </label>
              </FloatLabel>
            </div>

            {!isDeposit && amount > 0 && (
              <div className="bg-yellow-50 p-5 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="pi pi-info-circle text-yellow-600 text-xl"></i>
                  <div>
                    <div className="text-xs text-yellow-700 font-semibold uppercase mb-1">Saldo después del retiro</div>
                    <div className="text-2xl font-bold text-yellow-800">{formatCurrency(user.sld_cta - amount)}</div>
                  </div>
                </div>
              </div>
            )}

            {isDeposit && amount > 0 && (
              <div className="bg-green-50 p-5 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="pi pi-check-circle text-green-600 text-xl"></i>
                  <div>
                    <div className="text-xs text-green-700 font-semibold uppercase mb-1">Nuevo saldo</div>
                    <div className="text-2xl font-bold text-green-800">{formatCurrency(user.sld_cta + amount)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                type="button"
                label="Cancelar"
                icon="pi pi-times"
                onClick={onBack}
                severity="secondary"
                className="p-4 h-14 text-base font-semibold"
              />
              
              <Button
                type="submit"
                label={loading ? "Procesando..." : `Confirmar ${isDeposit ? 'Depósito' : 'Retiro'}`}
                icon={loading ? "pi pi-spinner pi-spin" : isDeposit ? "pi pi-check" : "pi pi-arrow-down"}
                loading={loading}
                disabled={loading || !amount || amount <= 0 || (!isDeposit && amount > user.sld_cta)}
                severity={isDeposit ? "success" : "danger"}
                className="p-4 h-14 text-base font-semibold"
              />
            </div>
          </form>
        </div>
      </Card>
      <Toast ref={toast} />
    </div>
  )
}

export default AccountOperations