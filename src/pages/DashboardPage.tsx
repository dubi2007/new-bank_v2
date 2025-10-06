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
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Avatar 
        icon="pi pi-user" 
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      />
      <div>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 'bold', 
          color: '#374151',
          margin: 0
        }}>
          {user.titular?.nom_tit} {user.titular?.fir_ape_tit}
        </h3>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280',
          margin: 0
        }}>
          {user.titular?.eml_tit}
        </p>
      </div>
    </div>
  )

  const toolbarEnd = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {currentView !== 'home' && (
        <Button
          icon="pi pi-home"
          label="Inicio"
          onClick={() => setCurrentView('home')}
          severity="info"
          size="small"
        />
      )}
      <Button
        icon="pi pi-user"
        label="Mi Info"
        onClick={() => setShowUserModal(true)}
        severity="secondary"
        size="small"
      />
      <Button
        icon="pi pi-sign-out"
        label="Salir"
        onClick={logout}
        severity="danger"
        size="small"
      />
    </div>
  )

  const renderHome = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Información del Usuario */}
      <Panel header="Información del usuario" style={{ backgroundColor: '#e0f2fe' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div>
            <strong>BIENVENIDO:</strong> {user.titular?.nom_tit}
          </div>
          <div>
            <strong>TIPO DE CUENTA:</strong> {user.tpo_cta}
          </div>
          <div style={{ fontFamily: 'monospace' }}>
            <strong>NRO DE CUENTA:</strong> {user.nro_cta}
          </div>
          <div>
            <strong>SALDO ACTUAL:</strong> {formatCurrency(user.sld_cta)}
          </div>
        </div>
      </Panel>

      {/* Saldo Principal */}
      <Card 
        header={
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar 
                icon="pi pi-chart-line" 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Saldo Disponible</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>Tu dinero siempre seguro</p>
              </div>
            </div>
            <Button
              icon={showBalance ? "pi pi-eye-slash" : "pi pi-eye"}
              onClick={() => setShowBalance(!showBalance)}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none'
              }}
              rounded
            />
          </div>
        }
        style={{ textAlign: 'center' }}
      >
        <div style={{ padding: '2rem' }}>
          <div style={{ 
            fontSize: showBalance ? '3rem' : '2rem', 
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '1rem',
            transition: 'all 0.3s ease'
          }}>
            {showBalance ? formatCurrency(user.sld_cta) : '••••••'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#10b981', 
              borderRadius: '50%' 
            }}></div>
            <span style={{ color: '#10b981', fontWeight: '500' }}>Cuenta Activa</span>
          </div>
        </div>
      </Card>

      {/* Operaciones Disponibles */}
      <Panel header="Operaciones Disponibles">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <Button
            icon="pi pi-plus-circle"
            label="Depositar"
            onClick={() => setCurrentView('deposit')}
            severity="success"
            style={{ padding: '1rem', height: '4rem' }}
          />
          <Button
            icon="pi pi-minus-circle"
            label="Retirar"
            onClick={() => setCurrentView('withdraw')}
            severity="danger"
            style={{ padding: '1rem', height: '4rem' }}
          />
          <Button
            icon="pi pi-history"
            label="Historial"
            onClick={() => setCurrentView('history')}
            severity="info"
            style={{ padding: '1rem', height: '4rem' }}
          />
          <Button
            icon="pi pi-user-edit"
            label="Modificar Datos"
            onClick={() => setShowUserModal(true)}
            severity="secondary"
            style={{ padding: '1rem', height: '4rem' }}
          />
        </div>
      </Panel>
    </div>
  )

  const renderHistory = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: '#374151' }}>Historial de Operaciones</h2>
        <Button
          icon="pi pi-refresh"
          label="Actualizar"
          onClick={loadOperations}
          loading={loading}
          severity="info"
          size="small"
        />
      </div>

      <Card>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Toolbar 
        start={toolbarStart}
        end={toolbarEnd}
        style={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}
      />

      <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
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