import React, { useState, useEffect } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Panel } from 'primereact/panel'
import { Avatar } from 'primereact/avatar'
import { Toolbar } from 'primereact/toolbar'
import { Tag } from 'primereact/tag'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useAuth } from '../hooks/useAuth'
import { BankService } from '../services/bankService'
import AccountOperations from '../components/AccountOperations'
import UserInfoModal from '../components/UserInfoModal'
import type { OperacionCompleta } from '../types'

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<'home' | 'deposit' | 'withdraw' | 'history' | 'profile'>('home')
  const [showBalance, setShowBalance] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [operations, setOperations] = useState<OperacionCompleta[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && currentView === 'history') {
      loadOperations()
    }
  }, [user, currentView])

  const loadOperations = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await BankService.getHistorial(user.idn_tit)
      setOperations(data)
    } catch (error) {
      console.error('Error loading operations:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshAccount = async () => {
    if (!user) return
    try {
      const updatedAccount = await BankService.getCuentaInfo(user.idn_cta)
      if (updatedAccount) {
        // Actualizar el contexto de autenticación con los nuevos datos
        localStorage.setItem('bankUser', JSON.stringify(updatedAccount))
        window.location.reload() // Recargar para actualizar el contexto
      }
    } catch (error) {
      console.error('Error refreshing account:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const operationTypeTemplate = (rowData: OperacionCompleta) => {
    const getColor = (type: string) => {
      switch (type) {
        case 'DEPOSITO': return 'success'
        case 'RETIRO': return 'danger'
        case 'TRANSFERENCIA': return 'info'
        default: return 'secondary'
      }
    }
    
    return <Tag value={rowData.tipo} severity={getColor(rowData.tipo)} />
  }

  const amountTemplate = (rowData: OperacionCompleta) => {
    const isPositive = rowData.tipo === 'DEPOSITO'
    return (
      <span style={{ 
        color: isPositive ? '#10b981' : '#ef4444',
        fontWeight: 'bold',
        fontFamily: 'monospace'
      }}>
        {isPositive ? '+' : '-'}{formatCurrency(rowData.monto)}
      </span>
    )
  }

  const dateTemplate = (rowData: OperacionCompleta) => {
    return formatDate(rowData.fch_ope)
  }

  if (!user) {
    return null
  }

  const toolbarStart = (
    <div className="flex items-center gap-4 group">
      <div className="relative">
        <Avatar 
          icon="pi pi-user" 
          className="bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg ring-2 ring-blue-200 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
        />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
      <div className="transition-all duration-200">
        <h3 className="text-lg font-bold text-gray-800 m-0 tracking-tight">
          {user.titular?.nom_tit} {user.titular?.fir_ape_tit}
        </h3>
        <p className="text-sm text-gray-500 m-0 flex items-center gap-1">
          <i className="pi pi-envelope text-xs"></i>
          {user.titular?.eml_tit}
        </p>
      </div>
    </div>
  )

  const toolbarEnd = (
    <div className="flex items-center gap-2">
      {currentView !== 'home' && (
        <Button
          icon="pi pi-home"
          label="Inicio"
          onClick={() => setCurrentView('home')}
          severity="info"
          size="small"
          className="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
        />
      )}
      <Button
        icon="pi pi-user"
        label="Mi Info"
        onClick={() => setShowUserModal(true)}
        severity="secondary"
        size="small"
        className="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
      />
      <Button
        icon="pi pi-sign-out"
        label="Salir"
        onClick={logout}
        severity="danger"
        size="small"
        className="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
      />
    </div>
  )

  const renderHome = () => (
    <div className="flex flex-col gap-6">
      {/* Información del Usuario */}
      <Panel 
        header="Información del usuario" 
        className=" from-blue-50 to-indigo-50   shadow-lg rounded-xl "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-500">
            <div className="text-xs text-gray-500 mb-1 font-medium">BIENVENIDO</div>
            <div className="font-bold text-gray-800 text-lg">{user.titular?.nom_tit}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-purple-500">
            <div className="text-xs text-gray-500 mb-1 font-medium">TIPO DE CUENTA</div>
            <div className="font-bold text-gray-800 text-lg">{user.tpo_cta}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-indigo-500">
            <div className="text-xs text-gray-500 mb-1 font-medium">NRO DE CUENTA</div>
            <div className="font-mono font-bold text-gray-800 text-lg">{user.nro_cta}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-green-500">
            <div className="text-xs text-gray-500 mb-1 font-medium">SALDO ACTUAL</div>
            <div className="font-bold text-green-600 text-lg">{formatCurrency(user.sld_cta)}</div>
          </div>
        </div>
      </Panel>

      {/* Saldo Principal */}
      <Card 
        header={
            
          <div className="relative  bg-gray-500 text-white p-6 flex items-center justify-between overflow-hidden rounded-t-xl">
            {/* Efectos decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <Avatar 
                icon="pi pi-chart-line" 
                className="bg-white/30 text-white shadow-lg backdrop-blur-sm border border-white/40"
                size="large"
              />
              <div>
                <h2 className="m-0 text-2xl font-bold tracking-tight drop-shadow-md">Saldo Disponible</h2>
                <p className="m-0 opacity-95 text-sm font-medium">Tu dinero siempre seguro</p>
              </div>
            </div>
            <Button
              icon={showBalance ? "pi pi-eye-slash" : "pi pi-eye"}
              onClick={() => setShowBalance(!showBalance)}
              className="bg-white/20 border-none hover:bg-white/30 transition-all duration-200 hover:scale-110"
              rounded
            />
          </div>
        }
        className="text-center shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0"
      >
        <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className={`font-bold text-gray-800 mb-4 transition-all duration-300 ${
            showBalance ? 'text-5xl' : 'text-3xl'
          }`}>
            {showBalance ? formatCurrency(user.sld_cta) : '••••••'}
          </div>
          <div className="inline-flex items-center justify-center gap-2 bg-green-50 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-semibold text-sm">Cuenta Activa</span>
          </div>
        </div>
      </Card>

      {/* Operaciones Disponibles */}
      <Panel 
        header="Operaciones Disponibles"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
          <Button
            icon="pi pi-plus-circle"
            label="Depositar"
            onClick={() => setCurrentView('deposit')}
            severity="success"
            className="p-4 h-20 text-base font-semibold"
          />
          <Button
            icon="pi pi-minus-circle"
            label="Retirar"
            onClick={() => setCurrentView('withdraw')}
            severity="danger"
            className="p-4 h-20 text-base font-semibold"
          />
          <Button
            icon="pi pi-history"
            label="Historial"
            onClick={() => setCurrentView('history')}
            severity="info"
            className="p-4 h-20 text-base font-semibold"
          />
          <Button
            icon="pi pi-user-edit"
            label="Modificar Datos"
            onClick={() => setShowUserModal(true)}
            severity="secondary"
            className="p-4 h-20 text-base font-semibold"
          />
        </div>
      </Panel>
    </div>
  )

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="m-0 text-gray-800 text-2xl font-bold flex items-center gap-3">
          <i className="pi pi-history text-blue-500"></i>
          Historial de Operaciones
        </h2>
        <Button
          icon="pi pi-refresh"
          label="Actualizar"
          onClick={loadOperations}
          loading={loading}
          severity="info"
          size="small"
          className="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
        />
      </div>

      <Card className="shadow-xl border-0">
        <DataTable 
          value={operations} 
          loading={loading}
          emptyMessage="No hay operaciones registradas"
          paginator
          rows={10}
          responsiveLayout="scroll"
        >
          <Column 
            field="fch_ope" 
            header="Fecha / Hora" 
            body={dateTemplate}
            sortable
          />
          <Column 
            field="tipo" 
            header="Operación" 
            body={operationTypeTemplate}
          />
          <Column 
            field="monto" 
            header="Monto" 
            body={amountTemplate}
          />
          <Column 
            field="idn_ope" 
            header="ID Operación"
            style={{ fontFamily: 'monospace' }}
          />
        </DataTable>
      </Card>
    </div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'deposit':
      case 'withdraw':
        return (
          <AccountOperations 
            type={currentView}
            user={user}
            onSuccess={refreshAccount}
            onBack={() => setCurrentView('home')}
          />
        )
      case 'history':
        return renderHistory()
      default:
        return renderHome()
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Toolbar 
        start={toolbarStart}
        end={toolbarEnd}
        className="mb-6"
      />

      <div className="px-4 md:px-8 pb-8 max-w-7xl mx-auto w-full">
        {renderCurrentView()}
      </div>

      <UserInfoModal
        user={user}
        visible={showUserModal}
        onHide={() => setShowUserModal(false)}
        onUserUpdated={refreshAccount}
      />
    </div>
  )
}

export default DashboardPage