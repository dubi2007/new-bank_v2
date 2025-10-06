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
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem',
      background: isDeposit 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      borderRadius: '8px 8px 0 0'
    }}>
      <Avatar 
        icon={isDeposit ? "pi pi-plus-circle" : "pi pi-minus-circle"}
        size="xlarge"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          marginBottom: '1rem'
        }}
      />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
        {isDeposit ? 'DEPÓSITO' : 'RETIRO'}
      </h1>
      <p style={{ margin: 0, opacity: 0.9 }}>
        {isDeposit ? 'Agregar dinero a tu cuenta' : 'Retirar dinero de tu cuenta'}
      </p>
    </div>
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card 
        header={headerContent}
        style={{ 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ padding: '2rem' }}>
          {/* Información de la cuenta */}
          <div style={{ 
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              fontSize: '0.875rem'
            }}>
              <div>
                <strong>Cuenta:</strong> {user.nro_cta}
              </div>
              <div>
                <strong>Titular:</strong> {user.titular?.nom_tit} {user.titular?.fir_ape_tit}
              </div>
              <div>
                <strong>Saldo Actual:</strong> 
                <span style={{ 
                  color: '#059669', 
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}>
                  {formatCurrency(user.sld_cta)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <FloatLabel>
              <InputNumber
                id="amount"
                value={amount}
                onValueChange={(e) => setAmount(e.value || 0)}
                mode="currency"
                currency="PEN"
                locale="es-PE"
                style={{ width: '100%', textAlign: 'center', fontSize: '1.5rem' }}
                min={0}
                max={isDeposit ? 1000000 : user.sld_cta}
                showButtons
                step={10}
              />
              <label htmlFor="amount">
                <i className={`pi ${isDeposit ? 'pi-plus-circle' : 'pi-minus-circle'}`} style={{ marginRight: '0.5rem' }}></i>
                MONTO A {isDeposit ? 'DEPOSITAR' : 'RETIRAR'}
              </label>
            </FloatLabel>

            {!isDeposit && amount > 0 && (
              <div style={{ 
                padding: '1rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <strong>Saldo después del retiro:</strong> {formatCurrency(user.sld_cta - amount)}
              </div>
            )}

            {isDeposit && amount > 0 && (
              <div style={{ 
                padding: '1rem',
                backgroundColor: '#d1fae5',
                border: '1px solid #10b981',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <strong>Nuevo saldo:</strong> {formatCurrency(user.sld_cta + amount)}
              </div>
            )}

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem' 
            }}>
              <Button
                type="button"
                label="Cancelar"
                onClick={onBack}
                severity="secondary"
                style={{ padding: '1rem' }}
              />
              
              <Button
                type="submit"
                label={loading ? "Procesando..." : `Confirmar ${isDeposit ? 'Depósito' : 'Retiro'}`}
                loading={loading}
                disabled={loading || !amount || amount <= 0 || (!isDeposit && amount > user.sld_cta)}
                severity={isDeposit ? "success" : "danger"}
                style={{ padding: '1rem' }}
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