import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { Toast } from 'primereact/toast'
import { Avatar } from 'primereact/avatar'
import { Panel } from 'primereact/panel'
import { BankService } from '../services/bankService'
import type { RegisterData } from '../types'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useRef<Toast>(null)
  const [formData, setFormData] = useState<RegisterData>({
    nom_tit: '',
    fir_ape_tit: '',
    sec_ape_tit: '',
    dni_tit: '',
    eml_tit: '',
    tlf_tit: '',
    tpo_cta: 'AHORRO',
    pin_cta: '',
    saldo_inicial: 0
  })
  const [loading, setLoading] = useState(false)
  const [generatedAccountNumber, setGeneratedAccountNumber] = useState('')
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    setGeneratedAccountNumber(BankService.generateAccountNumber())
  }, [])

  const accountTypes = [
    { label: 'AHORRO', value: 'AHORRO' },
    { label: 'CORRIENTE', value: 'CORRIENTE' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Por favor completa todos los campos correctamente',
        life: 5000
      })
      return
    }

    setLoading(true)

    try {
      const registerDataWithAccountNumber = {
        ...formData,
        nro_cta_predefinido: generatedAccountNumber
      }
      
      const result = await BankService.register(registerDataWithAccountNumber)
      if (result) {
        toast.current?.show({
          severity: 'success',
          summary: '¡Cuenta creada exitosamente!',
          detail: `Tu número de cuenta es: ${generatedAccountNumber}. Guárdalo para iniciar sesión.`,
          life: 10000
        })
        
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error al crear cuenta',
          detail: 'Verifica que el DNI, email y teléfono no estén registrados.',
          life: 8000
        })
      }
    } catch (error) {
      console.error('Register error:', error)
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

  const handleInputChange = (field: keyof RegisterData, value: any) => {
    if (field === 'dni_tit' && typeof value === 'string') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 8)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else if (field === 'tlf_tit' && typeof value === 'string') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 15)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else if (field === 'pin_cta' && typeof value === 'string') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else if (field === 'nom_tit' || field === 'fir_ape_tit' || field === 'sec_ape_tit') {
      const cleanValue = typeof value === 'string' ? value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') : value
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.current?.show({
        severity: 'info',
        summary: 'Copiado',
        detail: 'Número de cuenta copiado al portapapeles',
        life: 3000
      })
    } catch (error) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Error',
        detail: 'No se pudo copiar al portapapeles',
        life: 3000
      })
    }
  }

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    return (
      formData.nom_tit.trim().length >= 2 &&
      formData.fir_ape_tit.trim().length >= 2 &&
      formData.sec_ape_tit.trim().length >= 2 &&
      formData.dni_tit.length === 8 &&
      emailRegex.test(formData.eml_tit) &&
      formData.tlf_tit.length >= 7 &&
      formData.pin_cta.length === 4 &&
      formData.saldo_inicial >= 0
    )
  }

  const resetForm = () => {
    setFormData({
      nom_tit: '',
      fir_ape_tit: '',
      sec_ape_tit: '',
      dni_tit: '',
      eml_tit: '',
      tlf_tit: '',
      tpo_cta: 'AHORRO',
      pin_cta: '',
      saldo_inicial: 0
    })
    setGeneratedAccountNumber(BankService.generateAccountNumber())
  }

  const headerContent = (
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      borderRadius: '8px 8px 0 0'
    }}>
      <Avatar 
        icon="pi pi-user-plus" 
        size="xlarge"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          marginBottom: '1rem'
        }}
      />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
        REGISTRO DE CUENTA
      </h1>
      <p style={{ margin: 0, opacity: 0.9 }}>
        Crear nueva cuenta bancaria
      </p>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: '',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card 
          header={headerContent}
          style={{ 
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              {/* Layout en 2 columnas */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                {/* Columna izquierda */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Número de cuenta */}
                  <Panel 
                    header={
                      <div>
                        <i className="pi pi-credit-card" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                        <strong>TU NÚMERO DE CUENTA</strong>
                      </div>
                    }
                    style={{ 
                      backgroundColor: '#f8fafc',
                      border: '2px solid #10b981'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '2px solid #10b981'
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold',
                          color: '#10b981',
                          letterSpacing: '0.1em'
                        }}>
                          {generatedAccountNumber}
                        </span>
                        <p style={{ 
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          <i className="pi pi-info-circle" style={{ marginRight: '0.25rem' }}></i>
                          Guarda este número
                        </p>
                      </div>
                      <Button
                        icon="pi pi-copy"
                        onClick={() => copyToClipboard(generatedAccountNumber)}
                        severity="success"
                        outlined
                        rounded
                        tooltip="Copiar"
                        disabled={loading}
                      />
                    </div>
                  </Panel>

                  {/* Datos Personales */}
                  <Panel 
                    header={
                      <div>
                        <i className="pi pi-user" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
                        <strong>DATOS PERSONALES</strong>
                      </div>
                    }
                    style={{ border: '2px solid #dbeafe' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
                      <FloatLabel>
                        <InputText
                          id="nom_tit"
                          value={formData.nom_tit}
                          onChange={(e) => handleInputChange('nom_tit', e.target.value)}
                          style={{ width: '100%' }}
                          disabled={loading}
                          autoComplete="off"
                        />
                        <label htmlFor="nom_tit">
                          <i className="pi pi-user" style={{ marginRight: '0.5rem' }}></i>
                          NOMBRES *
                        </label>
                      </FloatLabel>

                      <FloatLabel>
                        <InputText
                          id="fir_ape_tit"
                          value={formData.fir_ape_tit}
                          onChange={(e) => handleInputChange('fir_ape_tit', e.target.value)}
                          style={{ width: '100%' }}
                          disabled={loading}
                          autoComplete="off"
                        />
                        <label htmlFor="fir_ape_tit">PRIMER APELLIDO *</label>
                      </FloatLabel>

                      <FloatLabel>
                        <InputText
                          id="sec_ape_tit"
                          value={formData.sec_ape_tit}
                          onChange={(e) => handleInputChange('sec_ape_tit', e.target.value)}
                          style={{ width: '100%' }}
                          disabled={loading}
                          autoComplete="off"
                        />
                        <label htmlFor="sec_ape_tit">SEGUNDO APELLIDO *</label>
                      </FloatLabel>

                      <FloatLabel>
                        <InputText
                          id="dni_tit"
                          value={formData.dni_tit}
                          onChange={(e) => handleInputChange('dni_tit', e.target.value)}
                          style={{ width: '100%', fontFamily: 'monospace' }}
                          maxLength={8}
                          disabled={loading}
                          autoComplete="off"
                        />
                        <label htmlFor="dni_tit">
                          <i className="pi pi-id-card" style={{ marginRight: '0.5rem' }}></i>
                          DNI (8 DÍGITOS) *
                        </label>
                      </FloatLabel>
                    </div>
                  </Panel>
                </div>

                {/* Columna derecha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Información de Contacto */}
                  <Panel 
                    header={
                      <div>
                        <i className="pi pi-envelope" style={{ marginRight: '0.5rem', color: '#8b5cf6' }}></i>
                        <strong>INFORMACIÓN DE CONTACTO</strong>
                      </div>
                    }
                    style={{ border: '2px solid #ede9fe' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
                      <FloatLabel>
                        <InputText
                          id="eml_tit"
                          type="email"
                          value={formData.eml_tit}
                          onChange={(e) => handleInputChange('eml_tit', e.target.value)}
                          style={{ width: '100%' }}
                          disabled={loading}
                          autoComplete="off"
                        />
                        <label htmlFor="eml_tit">
                          <i className="pi pi-envelope" style={{ marginRight: '0.5rem' }}></i>
                          CORREO ELECTRÓNICO *
                        </label>
                      </FloatLabel>

                      <FloatLabel>
                        <InputText
                          id="tlf_tit"
                          value={formData.tlf_tit}
                          onChange={(e) => handleInputChange('tlf_tit', e.target.value)}
                          style={{ width: '100%', fontFamily: 'monospace' }}
                          maxLength={15}
                          disabled={loading}
                          autoComplete="off"
                        />
                        <label htmlFor="tlf_tit">
                          <i className="pi pi-phone" style={{ marginRight: '0.5rem' }}></i>
                          TELÉFONO (MÍN. 7 DÍGITOS) *
                        </label>
                      </FloatLabel>
                    </div>
                  </Panel>

                  {/* Configuración de Cuenta */}
                  <Panel 
                    header={
                      <div>
                        <i className="pi pi-cog" style={{ marginRight: '0.5rem', color: '#f59e0b' }}></i>
                        <strong>CONFIGURACIÓN DE CUENTA</strong>
                      </div>
                    }
                    style={{ border: '2px solid #fef3c7' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
                      <FloatLabel>
                        <Dropdown
                          id="tpo_cta"
                          value={formData.tpo_cta}
                          onChange={(e) => handleInputChange('tpo_cta', e.value)}
                          options={accountTypes}
                          style={{ width: '100%' }}
                          disabled={loading}
                        />
                        <label htmlFor="tpo_cta">
                          <i className="pi pi-credit-card" style={{ marginRight: '0.5rem' }}></i>
                          TIPO DE CUENTA *
                        </label>
                      </FloatLabel>

                      <div style={{ position: 'relative' }}>
                        <FloatLabel>
                          <InputText
                            id="pin_cta"
                            type={showPin ? "text" : "password"}
                            value={formData.pin_cta}
                            onChange={(e) => handleInputChange('pin_cta', e.target.value)}
                            style={{ 
                              width: '100%', 
                              fontFamily: 'monospace', 
                              textAlign: 'center',
                              fontSize: '1.25rem',
                              paddingRight: '3.5rem'
                            }}
                            maxLength={4}
                            disabled={loading}
                            autoComplete="off"
                          />
                          <label htmlFor="pin_cta">
                            <i className="pi pi-lock" style={{ marginRight: '0.5rem' }}></i>
                            PIN (4 DÍGITOS) *
                          </label>
                        </FloatLabel>
                        
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 20,
                            background: 'transparent',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            color: '#9ca3af',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.5 : 1
                          }}
                          disabled={loading}
                          onMouseEnter={(e) => {
                            if (!loading) {
                              e.currentTarget.style.color = '#10b981'
                              e.currentTarget.style.backgroundColor = '#f3f4f6'
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#9ca3af'
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <i className={`pi ${showPin ? "pi-eye-slash" : "pi-eye"}`} style={{ fontSize: '1.125rem' }}></i>
                        </button>
                      </div>

                      <FloatLabel>
                        <InputNumber
                          id="saldo_inicial"
                          value={formData.saldo_inicial}
                          onValueChange={(e) => handleInputChange('saldo_inicial', e.value || 0)}
                          mode="currency"
                          currency="PEN"
                          locale="es-PE"
                          style={{ width: '100%' }}
                          min={0}
                          disabled={loading}
                        />
                        <label htmlFor="saldo_inicial">
                          <i className="pi pi-dollar" style={{ marginRight: '0.5rem' }}></i>
                          SALDO INICIAL
                        </label>
                      </FloatLabel>
                    </div>
                  </Panel>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <Button
                  type="button"
                  label="LIMPIAR"
                  onClick={resetForm}
                  severity="warning"
                  style={{ padding: '1rem', fontWeight: 'bold' }}
                  icon="pi pi-refresh"
                  disabled={loading}
                />

                <Button
                  type="submit"
                  label={loading ? "REGISTRANDO..." : "REGISTRAR"}
                  loading={loading}
                  disabled={loading || !isFormValid()}
                  severity="success"
                  style={{ padding: '1rem', fontWeight: 'bold' }}
                  icon="pi pi-check"
                />

                <Button
                  type="button"
                  label="REGRESAR"
                  onClick={() => navigate('/login')}
                  severity="danger"
                  outlined
                  style={{ padding: '1rem', fontWeight: 'bold' }}
                  icon="pi pi-arrow-left"
                  disabled={loading}
                />
              </div>
            </form>
          </div>
        </Card>
        <Toast ref={toast} />
      </div>
    </div>
  )
}

export default RegisterPage