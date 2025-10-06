import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { Toast } from 'primereact/toast'
import { Panel } from 'primereact/panel'
import { Tag } from 'primereact/tag'
import { BankService } from '../services/bankService'
import type { CuentaBancaria } from '../types'

interface UserInfoModalProps {
  user: CuentaBancaria
  visible: boolean
  onHide: () => void
  onUserUpdated: () => void
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ user, visible, onHide, onUserUpdated }) => {
  const toast = useRef<Toast>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editData, setEditData] = useState({
    eml_tit: '',
    tlf_tit: ''
  })

  useEffect(() => {
    if (user.titular) {
      setEditData({
        eml_tit: user.titular.eml_tit,
        tlf_tit: user.titular.tlf_tit
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user.titular) return

    setLoading(true)

    try {
      const success = await BankService.updateTitular(
        user.titular.idn_tit,
        editData.eml_tit,
        editData.tlf_tit
      )

      if (success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Datos actualizados',
          detail: 'Tu información ha sido actualizada correctamente',
          life: 3000
        })
        setIsEditing(false)
        onUserUpdated()
        
        setTimeout(() => {
          onHide()
        }, 2000)
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error al actualizar',
          detail: 'No se pudieron actualizar los datos',
          life: 4000
        })
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de conexión',
        detail: 'No se pudo conectar al servidor',
        life: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: 'eml_tit' | 'tlf_tit', value: string) => {
    if (field === 'tlf_tit') {
      // Solo números, entre 7 y 15 dígitos
      const cleanValue = value.replace(/\D/g, '').slice(0, 15)
      setEditData(prev => ({ ...prev, [field]: cleanValue }))
    } else {
      setEditData(prev => ({ ...prev, [field]: value }))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.current?.show({
      severity: 'info',
      summary: 'Copiado',
      detail: 'Texto copiado al portapapeles',
      life: 2000
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return (
      editData.eml_tit.trim() !== '' &&
      emailRegex.test(editData.eml_tit) &&
      editData.tlf_tit.length >= 7
    )
  }

  const dialogFooter = (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      {isEditing ? (
        <>
          <Button
            label="Cancelar"
            onClick={() => {
              setIsEditing(false)
              if (user.titular) {
                setEditData({
                  eml_tit: user.titular.eml_tit,
                  tlf_tit: user.titular.tlf_tit
                })
              }
            }}
            severity="secondary"
          />
          <Button
            label={loading ? "Guardando..." : "Guardar"}
            onClick={handleSave}
            loading={loading}
            disabled={loading || !isFormValid()}
            severity="success"
          />
        </>
      ) : (
        <>
          <Button
            label="Modificar Datos"
            onClick={() => setIsEditing(true)}
            severity="info"
          />
          <Button
            label="Cerrar"
            onClick={onHide}
            severity="secondary"
          />
        </>
      )}
    </div>
  )

  if (!user.titular) {
    return null
  }

  return (
    <Dialog
      header="Información del Usuario"
      visible={visible}
      onHide={onHide}
      footer={dialogFooter}
      style={{ width: '90vw', maxWidth: '600px' }}
      modal
      dismissableMask
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Datos Personales (No editables) */}
        <Panel header="Datos Personales" toggleable>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem'
          }}>
            <div>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                Nombre Completo
              </label>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontWeight: 'bold',
                color: '#374151'
              }}>
                {user.titular.nom_tit} {user.titular.fir_ape_tit} {user.titular.sec_ape_tit}
              </p>
            </div>
            
            <div>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                DNI
              </label>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                {user.titular.dni_tit}
              </p>
            </div>
          </div>
        </Panel>

        {/* Información de Contacto (Editable) */}
        <Panel header="Información de Contacto" toggleable>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem'
          }}>
            {isEditing ? (
              <>
                <FloatLabel>
                  <InputText
                    id="eml_tit"
                    type="email"
                    value={editData.eml_tit}
                    onChange={(e) => handleInputChange('eml_tit', e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <label htmlFor="eml_tit">
                    <i className="pi pi-envelope" style={{ marginRight: '0.5rem' }}></i>
                    Correo Electrónico
                  </label>
                </FloatLabel>

                <FloatLabel>
                  <InputText
                    id="tlf_tit"
                    value={editData.tlf_tit}
                    onChange={(e) => handleInputChange('tlf_tit', e.target.value)}
                    style={{ width: '100%', fontFamily: 'monospace' }}
                    maxLength={15}
                  />
                  <label htmlFor="tlf_tit">
                    <i className="pi pi-phone" style={{ marginRight: '0.5rem' }}></i>
                    Teléfono
                  </label>
                </FloatLabel>
              </>
            ) : (
              <>
                <div>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500' 
                  }}>
                    <i className="pi pi-envelope" style={{ marginRight: '0.5rem' }}></i>
                    Correo Electrónico
                  </label>
                  <p style={{ 
                    margin: '0.25rem 0 0 0', 
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    {user.titular.eml_tit}
                  </p>
                </div>
                
                <div>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500' 
                  }}>
                    <i className="pi pi-phone" style={{ marginRight: '0.5rem' }}></i>
                    Teléfono
                  </label>
                  <p style={{ 
                    margin: '0.25rem 0 0 0', 
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    {user.titular.tlf_tit}
                  </p>
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* Información de Cuenta */}
        <Panel header="Información de Cuenta" toggleable>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem'
          }}>
            <div>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                Tipo de Cuenta
              </label>
              <div style={{ margin: '0.25rem 0 0 0' }}>
                <Tag value={user.tpo_cta} severity="info" />
              </div>
            </div>
            
            <div>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                Número de Cuenta
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                margin: '0.25rem 0 0 0'
              }}>
                <span style={{ 
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: '#374151'
                }}>
                  {user.nro_cta}
                </span>
                <Button
                  icon="pi pi-copy"
                  onClick={() => copyToClipboard(user.nro_cta)}
                  size="small"
                  text
                  rounded
                  tooltip="Copiar número de cuenta"
                />
              </div>
            </div>

            <div>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                CCI
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                margin: '0.25rem 0 0 0'
              }}>
                <span style={{ 
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  {user.cci_cta}
                </span>
                <Button
                  icon="pi pi-copy"
                  onClick={() => copyToClipboard(user.cci_cta)}
                  size="small"
                  text
                  rounded
                  tooltip="Copiar CCI"
                />
              </div>
            </div>

            <div>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                Saldo Actual
              </label>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#059669'
              }}>
                {formatCurrency(user.sld_cta)}
              </p>
            </div>
          </div>
        </Panel>
      </div>
      <Toast ref={toast} />
    </Dialog>
  )
}

export default UserInfoModal