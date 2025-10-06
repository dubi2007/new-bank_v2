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
          life: 6000
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
          life: 7000
        })
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de conexión',
        detail: 'No se pudo conectar al servidor',
        life: 7000
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
      life: 4000
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
    <div className="flex gap-3 justify-end p-4">
      {isEditing ? (
        <>
          <Button
            label="Cancelar"
            icon="pi pi-times"
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
            icon={loading ? "pi pi-spinner pi-spin" : "pi pi-check"}
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
            icon="pi pi-pencil"
            onClick={() => setIsEditing(true)}
            severity="info"
          />
          <Button
            label="Cerrar"
            icon="pi pi-times"
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
      className="w-[90vw] max-w-3xl"
      modal
      dismissableMask
    >
      <div className="flex flex-col gap-5 p-4">
        {/* Datos Personales (No editables) */}
        <Panel 
          header="Datos Personales"
          toggleable
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1 block">
                Nombre Completo
              </label>
              <p className="mt-1 mb-0 font-bold text-gray-800 text-lg">
                {user.titular.nom_tit} {user.titular.fir_ape_tit} {user.titular.sec_ape_tit}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1 block">
                DNI
              </label>
              <p className="mt-1 mb-0 font-mono font-bold text-gray-800 text-lg">
                {user.titular.dni_tit}
              </p>
            </div>
          </div>
        </Panel>

        {/* Información de Contacto (Editable) */}
        <Panel 
          header={
            <div className="flex items-center gap-2">
              <i className="pi pi-envelope text-green-600"></i>
              <span className="font-bold">Información de Contacto</span>
              {isEditing && <Tag value="Editando" severity="warning" className="ml-2" />}
            </div>
          }
          toggleable
          className=""
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            {isEditing ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <FloatLabel>
                    <InputText
                      id="eml_tit"
                      type="email"
                      value={editData.eml_tit}
                      onChange={(e) => handleInputChange('eml_tit', e.target.value)}
                      className="w-full"
                    />
                    <label htmlFor="eml_tit">
                      <i className="pi pi-envelope mr-2"></i>
                      Correo Electrónico
                    </label>
                  </FloatLabel>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                  <FloatLabel>
                    <InputText
                      id="tlf_tit"
                      value={editData.tlf_tit}
                      onChange={(e) => handleInputChange('tlf_tit', e.target.value)}
                      className="w-full font-mono"
                      maxLength={15}
                    />
                    <label htmlFor="tlf_tit">
                      <i className="pi pi-phone mr-2"></i>
                      Teléfono
                    </label>
                  </FloatLabel>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-500">
                  <label className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1 flex items-center gap-2">
                    <i className="pi pi-envelope"></i>
                    Correo Electrónico
                  </label>
                  <p className="mt-1 mb-0 font-bold text-gray-800 text-base break-all">
                    {user.titular.eml_tit}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-green-500">
                  <label className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1 flex items-center gap-2">
                    <i className="pi pi-phone"></i>
                    Teléfono
                  </label>
                  <p className="mt-1 mb-0 font-mono font-bold text-gray-800 text-base">
                    {user.titular.tlf_tit}
                  </p>
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* Información de Cuenta */}
        <Panel 
          header="Información de Cuenta"
          toggleable
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1 block">
                Tipo de Cuenta
              </label>
              <div className="mt-1">
                <Tag value={user.tpo_cta} severity="info" className="text-sm font-bold" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1 block">
                Número de Cuenta
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-gray-800 text-base">
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

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1 block">
                CCI
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-gray-800 text-sm">
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

            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <label className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                <i className="pi pi-dollar"></i>
                Saldo Actual
              </label>
              <p className="mt-1 mb-0 text-2xl font-bold text-emerald-600">
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