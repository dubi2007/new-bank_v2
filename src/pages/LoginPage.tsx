import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { Toast } from 'primereact/toast'
import { Avatar } from 'primereact/avatar'
import { Divider } from 'primereact/divider'
import { BankService } from '../services/bankService'
import { useAuth } from '../hooks/useAuth'
import type { LoginData } from '../types'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useRef<Toast>(null)
  const [formData, setFormData] = useState<LoginData>({
    nro_cta: '',
    pin_cta: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await BankService.login(formData)
      if (result) {
        login(result)
        toast.current?.show({
          severity: 'success',
          summary: 'Bienvenido',
          detail: `Hola ${result.titular?.nom_tit}`,
          life: 6000
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error de autenticación',
          detail: 'Número de cuenta o PIN incorrectos',
          life: 8000
        })
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de conexión',
        detail: 'No se pudo conectar al servidor. Intenta nuevamente.',
        life: 8000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginData, value: string) => {
    if (field === 'nro_cta') {
      // Solo números, máximo 14 dígitos
      const cleanValue = value.replace(/\D/g, '').slice(0, 14)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else if (field === 'pin_cta') {
      // Solo números, máximo 4 dígitos
      const cleanValue = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    }
  }

  const getFilledDots = (value: string, max: number) => {
    return '●'.repeat(value.length) + '○'.repeat(max - value.length)
  }

  const headerContent = (
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '8px 8px 0 0'
    }}>
      <Avatar 
        icon="pi pi-building" 
        size="xlarge"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          marginBottom: '1rem'
        }}
      />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
        NUEVO PERÚ BANK
      </h1>
      <p style={{ margin: 0, opacity: 0.9 }}>
        Sistema de Cajero Automático
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <Card 
        header={headerContent}
        className="w-full max-w-md shadow-2xl"
      >
        <div className="p-8">
          <h2 className="text-center mb-8 text-gray-600 text-lg">
            Por favor, ingrese su tarjeta...
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div>
              <FloatLabel>
                <InputText
                  id="nro_cta"
                  value={formData.nro_cta}
                  onChange={(e) => handleInputChange('nro_cta', e.target.value)}
                  style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    letterSpacing: '0.1em'
                  }}
                  maxLength={14}
                />
                <label htmlFor="nro_cta">NÚMERO DE CUENTA (14 DÍGITOS)</label>
              </FloatLabel>
              
              <div style={{ 
                marginTop: '0.5rem', 
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  {getFilledDots(formData.nro_cta, 14).split('').map((dot, index) => (
                    <span 
                      key={index} 
                      style={{ 
                        color: dot === '●' ? '#667eea' : '#d1d5db',
                        fontSize: '0.75rem',
                        margin: '0 1px'
                      }}
                    >
                      {dot}
                    </span>
                  ))}
                </div>
                <div>{formData.nro_cta.length}/14 dígitos</div>
              </div>
            </div>

            <div>
              <div style={{ position: 'relative' }}>
                <FloatLabel>
                  <InputText
                    id="pin_cta"
                    type={showPin ? "text" : "password"}
                    value={formData.pin_cta}
                    onChange={(e) => handleInputChange('pin_cta', e.target.value)}
                    style={{ 
                      width: '100%', 
                      textAlign: 'center', 
                      fontFamily: 'monospace',
                      fontSize: '1.5rem',
                      letterSpacing: '0.3em',
                      paddingRight: '3rem'
                    }}
                    maxLength={4}
                  />
                  <label htmlFor="pin_cta">PIN (4 DÍGITOS)</label>
                </FloatLabel>
                
                <Button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  icon={showPin ? "pi pi-eye-slash" : "pi pi-eye"}
                  style={{ 
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10
                  }}
                  text
                  rounded
                />
              </div>
              
              <div style={{ 
                marginTop: '0.5rem', 
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  {getFilledDots(formData.pin_cta, 4).split('').map((dot, index) => (
                    <span 
                      key={index} 
                      style={{ 
                        color: dot === '●' ? '#667eea' : '#d1d5db',
                        fontSize: '1rem',
                        margin: '0 2px'
                      }}
                    >
                      {dot}
                    </span>
                  ))}
                </div>
                <div>{formData.pin_cta.length}/4 dígitos</div>
              </div>
            </div>

            <Button
              type="submit"
              label={loading ? "VALIDANDO..." : "INGRESAR"}
              loading={loading}
              disabled={loading || formData.nro_cta.length !== 14 || formData.pin_cta.length !== 4}
              style={{ 
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
              severity="info"
            />
          </form>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              backgroundColor: '#fbbf24', 
              color: '#92400e',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              ¿No tienes una cuenta?
            </div>
            
            <Button
              type="button"
              label="REGISTRATE"
              onClick={() => navigate('/register')}
              style={{ 
                backgroundColor: '#374151',
                border: 'none',
                padding: '0.75rem 2rem',
                fontWeight: 'bold'
              }}
            />
          </div>
        </div>
      </Card>
      <Toast ref={toast} />
    </div>
  )
}

export default LoginPage