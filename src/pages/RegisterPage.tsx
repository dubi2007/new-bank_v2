import React, { useState, useRef } from 'react'
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

  React.useEffect(() => {
    // Generar número de cuenta aleatorio para mostrar
    setGeneratedAccountNumber(BankService.generateAccountNumber())
  }, [])

  const accountTypes = [
    { label: 'AHORRO', value: 'AHORRO' },
    { label: 'CORRIENTE', value: 'CORRIENTE' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Usar el número de cuenta que ya se está mostrando en el formulario
      const registerDataWithAccountNumber = {
        ...formData,
        nro_cta_predefinido: generatedAccountNumber // Pasar el número mostrado
      }
      
      const result = await BankService.register(registerDataWithAccountNumber)
      if (result) {
        toast.current?.show({
          severity: 'success',
          summary: '¡Cuenta creada exitosamente!',
          detail: `Tu número de cuenta es: ${generatedAccountNumber}`,
          life: 8000
        })
        
        // Redirigir al login después de 3 segundos
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
      // Solo números, máximo 8 dígitos
      const cleanValue = value.replace(/\D/g, '').slice(0, 8)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else if (field === 'tlf_tit' && typeof value === 'string') {
      // Solo números, entre 7 y 15 dígitos
      const cleanValue = value.replace(/\D/g, '').slice(0, 15)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else if (field === 'pin_cta' && typeof value === 'string') {
      // Solo números, máximo 4 dígitos
      const cleanValue = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({ ...prev, [field]: cleanValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const isFormValid = () => {
    const validations = {
      nom_tit: formData.nom_tit.trim() !== '',
      fir_ape_tit: formData.fir_ape_tit.trim() !== '',
      sec_ape_tit: formData.sec_ape_tit.trim() !== '',
      dni_tit: formData.dni_tit.length === 8,
      eml_tit: formData.eml_tit.trim() !== '',
      tlf_tit: formData.tlf_tit.length >= 7,
      pin_cta: formData.pin_cta.length === 4,
      saldo_inicial: formData.saldo_inicial >= 0
    }

    // Debug: mostrar qué validaciones fallan
    const failed = Object.entries(validations).filter(([, valid]) => !valid)
    if (failed.length > 0) {
      console.log('Validaciones que fallan:', failed.map(([key]) => key))
      console.log('Valores actuales:', {
        nom_tit: `"${formData.nom_tit}" (longitud: ${formData.nom_tit.length})`,
        fir_ape_tit: `"${formData.fir_ape_tit}" (longitud: ${formData.fir_ape_tit.length})`,
        sec_ape_tit: `"${formData.sec_ape_tit}" (longitud: ${formData.sec_ape_tit.length})`,
        dni_tit: `"${formData.dni_tit}" (longitud: ${formData.dni_tit.length})`,
        eml_tit: `"${formData.eml_tit}" (longitud: ${formData.eml_tit.length})`,
        tlf_tit: `"${formData.tlf_tit}" (longitud: ${formData.tlf_tit.length})`,
        pin_cta: `"${formData.pin_cta}" (longitud: ${formData.pin_cta.length})`,
        saldo_inicial: formData.saldo_inicial
      })
    }

    const isValid = Object.values(validations).every(Boolean)
    console.log('Formulario válido:', isValid)
    return isValid
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
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card 
          header={headerContent}
          style={{ 
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ padding: '2rem' }}>
            {/* Número de cuenta generado */}
            <Panel 
              header="NÚMERO DE CUENTA"
              style={{ 
                marginBottom: '2rem',
                backgroundColor: '#f8fafc'
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
                <span style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  {generatedAccountNumber}
                </span>
                <Button
                  icon="pi pi-copy"
                  onClick={() => copyToClipboard(generatedAccountNumber)}
                  severity="success"
                  outlined
                  rounded
                  tooltip="Copiar número de cuenta"
                />
              </div>
            </Panel>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Datos Personales */}
              <Panel header="DATOS PERSONALES" toggleable>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1.5rem',
                  padding: '1rem 0'
                }}>
                  <FloatLabel>
                    <InputText
                      id="nom_tit"
                      value={formData.nom_tit}
                      onChange={(e) => handleInputChange('nom_tit', e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <label htmlFor="nom_tit">
                      <i className="pi pi-user" style={{ marginRight: '0.5rem' }}></i>
                      NOMBRE DEL TITULAR
                    </label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      id="fir_ape_tit"
                      value={formData.fir_ape_tit}
                      onChange={(e) => handleInputChange('fir_ape_tit', e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <label htmlFor="fir_ape_tit">PRIMER APELLIDO</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      id="sec_ape_tit"
                      value={formData.sec_ape_tit}
                      onChange={(e) => handleInputChange('sec_ape_tit', e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <label htmlFor="sec_ape_tit">SEGUNDO APELLIDO</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      id="dni_tit"
                      value={formData.dni_tit}
                      onChange={(e) => handleInputChange('dni_tit', e.target.value)}
                      style={{ width: '100%', fontFamily: 'monospace' }}
                      maxLength={8}
                    />
                    <label htmlFor="dni_tit">
                      <i className="pi pi-id-card" style={{ marginRight: '0.5rem' }}></i>
                      NÚMERO DE DNI
                    </label>
                  </FloatLabel>
                </div>
              </Panel>

              {/* Información de Contacto */}
              <Panel header="INFORMACIÓN DE CONTACTO" toggleable>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1.5rem',
                  padding: '1rem 0'
                }}>
                  <FloatLabel>
                    <InputText
                      id="eml_tit"
                      type="email"
                      value={formData.eml_tit}
                      onChange={(e) => handleInputChange('eml_tit', e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <label htmlFor="eml_tit">
                      <i className="pi pi-envelope" style={{ marginRight: '0.5rem' }}></i>
                      CORREO ELECTRÓNICO
                    </label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      id="tlf_tit"
                      value={formData.tlf_tit}
                      onChange={(e) => handleInputChange('tlf_tit', e.target.value)}
                      style={{ width: '100%', fontFamily: 'monospace' }}
                      maxLength={15}
                    />
                    <label htmlFor="tlf_tit">
                      <i className="pi pi-phone" style={{ marginRight: '0.5rem' }}></i>
                      TELÉFONO
                    </label>
                  </FloatLabel>
                </div>
              </Panel>

              {/* Configuración de Cuenta */}
              <Panel header="CONFIGURACIÓN DE CUENTA" toggleable>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1.5rem',
                  padding: '1rem 0'
                }}>
                  <FloatLabel>
                    <Dropdown
                      id="tpo_cta"
                      value={formData.tpo_cta}
                      onChange={(e) => handleInputChange('tpo_cta', e.value)}
                      options={accountTypes}
                      style={{ width: '100%' }}
                    />
                    <label htmlFor="tpo_cta">
                      <i className="pi pi-credit-card" style={{ marginRight: '0.5rem' }}></i>
                      TIPO DE CUENTA
                    </label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      id="pin_cta"
                      type="password"
                      value={formData.pin_cta}
                      onChange={(e) => handleInputChange('pin_cta', e.target.value)}
                      style={{ width: '100%', fontFamily: 'monospace', textAlign: 'center' }}
                      maxLength={4}
                    />
                    <label htmlFor="pin_cta">
                      <i className="pi pi-lock" style={{ marginRight: '0.5rem' }}></i>
                      CLAVE PIN (4 DÍGITOS)
                    </label>
                  </FloatLabel>

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
                    />
                    <label htmlFor="saldo_inicial">
                      <i className="pi pi-dollar" style={{ marginRight: '0.5rem' }}></i>
                      SALDO INICIAL
                    </label>
                  </FloatLabel>
                </div>
              </Panel>

              {/* Mensaje de validación */}
              {!isFormValid() && (
                <div style={{ 
                  backgroundColor: '#fef3cd', 
                  border: '1px solid #ffeaa7', 
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    <i className="pi pi-info-circle" style={{ marginRight: '0.5rem' }}></i>
                    Completa todos los campos:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {formData.nom_tit.trim() === '' && <li>Nombres</li>}
                    {formData.fir_ape_tit.trim() === '' && <li>Primer apellido</li>}
                    {formData.sec_ape_tit.trim() === '' && <li>Segundo apellido</li>}
                    {formData.dni_tit.length !== 8 && <li>DNI (8 dígitos)</li>}
                    {formData.eml_tit.trim() === '' && <li>Email</li>}
                    {formData.tlf_tit.length < 7 && <li>Teléfono (mínimo 7 dígitos)</li>}
                    {formData.pin_cta.length !== 4 && <li>PIN (4 dígitos)</li>}
                    {formData.saldo_inicial < 0 && <li>Saldo inicial (mayor o igual a 0)</li>}
                  </ul>
                </div>
              )}

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem' 
              }}>
                <Button
                  type="button"
                  label="LIMPIAR"
                  onClick={() => setFormData({
                    nom_tit: '',
                    fir_ape_tit: '',
                    sec_ape_tit: '',
                    dni_tit: '',
                    eml_tit: '',
                    tlf_tit: '',
                    tpo_cta: 'AHORRO',
                    pin_cta: '',
                    saldo_inicial: 0
                  })}
                  severity="warning"
                  style={{ padding: '1rem' }}
                />

                <Button
                  type="submit"
                  label={loading ? "REGISTRANDO..." : "REGISTRAR"}
                  loading={loading}
                  disabled={loading || !isFormValid()}
                  severity="success"
                  style={{ padding: '1rem' }}
                />

                <Button
                  type="button"
                  label="REGRESAR"
                  onClick={() => navigate('/login')}
                  severity="danger"
                  style={{ padding: '1rem' }}
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