import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { Toast } from 'primereact/toast'
import { Password } from 'primereact/password'
import { Divider } from 'primereact/divider'
import { Message } from 'primereact/message'
import { Panel } from 'primereact/panel'
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
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.nro_cta.length !== 14) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'El número de cuenta debe tener 14 dígitos',
        life: 5000
      })
      return
    }

    if (formData.pin_cta.length !== 4) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'El PIN debe tener 4 dígitos',
        life: 5000
      })
      return
    }

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
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error de autenticación',
          detail: 'Número de cuenta o PIN incorrectos',
          life: 8000
        })
      }
    } catch (error) {
      console.error('Login error:', error)
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
      const cleanValue = value.replace(/\D/g, '').slice(0, 14)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else if (field === 'pin_cta') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <Card className="shadow-lg border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="pi pi-building text-white text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">NUEVO PERÚ BANK</h1>
                <p className="text-gray-600">Sistema de Cajero Automático</p>
              </div>
            </div>
          </div>

          {/* Contenido en 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Formulario */}
            <div>
              <Panel
                header={
                  <div className="flex items-center gap-2">
                    <i className="pi pi-sign-in text-blue-600"></i>
                    <span className="font-semibold">Iniciar Sesión</span>
                  </div>
                }
                className="border-2 border-blue-200"
              >
                <p className="text-gray-600 mb-6">
                  Ingrese sus credenciales para acceder
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <FloatLabel>
                      <InputText
                        id="nro_cta"
                        value={formData.nro_cta}
                        onChange={(e) => handleInputChange('nro_cta', e.target.value)}
                        className="w-full"
                        maxLength={14}
                        autoComplete="off"
                        disabled={loading}
                        style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.05em' }}
                      />
                      <label htmlFor="nro_cta">
                        <i className="pi pi-credit-card mr-2"></i>
                        Número de Cuenta (14 dígitos)
                      </label>
                    </FloatLabel>
                    <small className="text-gray-500 mt-1 block">
                      {formData.nro_cta.length}/14 dígitos ingresados
                    </small>
                  </div>

                  <div>
                    <FloatLabel>
                      <Password
                        id="pin_cta"
                        value={formData.pin_cta}
                        onChange={(e) => handleInputChange('pin_cta', e.target.value)}
                        className="w-full"
                        maxLength={4}
                        autoComplete="off"
                        disabled={loading}
                        inputStyle={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.15em' }}
                        feedback={false}
                        toggleMask
                      />
                      <label htmlFor="pin_cta">
                        <i className="pi pi-lock mr-2"></i>
                        PIN Secreto (4 dígitos)
                      </label>
                    </FloatLabel>
                    <small className="text-gray-500 mt-1 block">
                      {formData.pin_cta.length}/4 dígitos ingresados
                    </small>
                  </div>

                  <Button
                    type="submit"
                    label={loading ? "Validando..." : "Ingresar"}
                    loading={loading}
                    disabled={loading || formData.nro_cta.length !== 14 || formData.pin_cta.length !== 4}
                    className="w-full"
                    size="large"
                    icon="pi pi-sign-in"
                  />
                </form>
              </Panel>
            </div>

            {/* Columna derecha - Información */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                <i className="pi pi-info-circle mr-2 text-blue-600"></i>
                Información de Acceso
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <i className="pi pi-check-circle text-green-600 mt-1"></i>
                  <div>
                    <p className="font-medium text-gray-800">Cuenta Segura</p>
                    <p className="text-sm text-gray-600">
                      Todas las transacciones están protegidas con encriptación de última generación
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <i className="pi pi-shield text-blue-600 mt-1"></i>
                  <div>
                    <p className="font-medium text-gray-800">PIN de 4 Dígitos</p>
                    <p className="text-sm text-gray-600">
                      Tu PIN es personal e intransferible. Nunca lo compartas con nadie
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <i className="pi pi-clock text-orange-600 mt-1"></i>
                  <div>
                    <p className="font-medium text-gray-800">Disponible 24/7</p>
                    <p className="text-sm text-gray-600">
                      Accede a tu cuenta en cualquier momento del día
                    </p>
                  </div>
                </div>
              </div>

              <Divider />

              <Message 
                severity="info" 
                text="¿No recuerdas tu número de cuenta? Revisa tu correo de registro o contacta con soporte."
                className="w-full"
              />
            </div>
          </div>

          {/* Sección de registro */}
          <Divider />
          
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              ¿No tienes una cuenta? Únete a miles de usuarios satisfechos
            </p>
            <Button
              type="button"
              label="Crear Cuenta Nueva"
              onClick={() => navigate('/register')}
              outlined
              size="large"
              icon="pi pi-user-plus"
              disabled={loading}
            />
          </div>
        </Card>
        <Toast ref={toast} />
      </div>
    </div>
  )
}

export default LoginPage