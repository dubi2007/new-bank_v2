import { supabase } from './supabase'
import type { CuentaBancaria, LoginData, RegisterData, OperacionCompleta } from '../types'

export class BankService {
  // Función para generar número de cuenta aleatorio (14 dígitos)
  static generateAccountNumber(): string {
    // Generar exactamente 14 dígitos
    let accountNumber = ''
    for (let i = 0; i < 14; i++) {
      accountNumber += Math.floor(Math.random() * 10).toString()
    }
    console.log('Número de cuenta generado:', accountNumber, 'longitud:', accountNumber.length)
    return accountNumber
  }

  // Función para generar CCI aleatorio (20 dígitos)
  static generateCCI(): string {
    // Generar exactamente 20 dígitos
    let cci = ''
    for (let i = 0; i < 20; i++) {
      cci += Math.floor(Math.random() * 10).toString()
    }
    console.log('CCI generado:', cci, 'longitud:', cci.length)
    return cci
  }

  // Verificar si un número de cuenta ya existe
  static async checkAccountExists(nro_cta: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cuenta_bancaria')
        .select('nro_cta')
        .eq('nro_cta', nro_cta)
        .maybeSingle()

      if (error) {
        console.error('Error verificando cuenta:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error en checkAccountExists:', error)
      return false
    }
  }

  // Generar número de cuenta único
  static async generateUniqueAccountNumber(): Promise<string> {
    let attempts = 0
    let accountNumber = ''
    
    do {
      accountNumber = this.generateAccountNumber()
      attempts++
      
      if (attempts > 10) {
        throw new Error('No se pudo generar un número de cuenta único después de 10 intentos')
      }
    } while (await this.checkAccountExists(accountNumber))
    
    console.log('Número de cuenta único generado después de', attempts, 'intentos:', accountNumber)
    return accountNumber
  }

  // Login
  static async login(loginData: LoginData): Promise<CuentaBancaria | null> {
    try {
      // Limpiar datos de login
      const cleanLoginData = this.cleanAndValidateData(loginData)
      
      // Hacer el login
      const { data, error } = await supabase
        .from('cuenta_bancaria')
        .select(`
          *,
          titular (*)
        `)
        .eq('nro_cta', cleanLoginData.nro_cta)
        .eq('pin_cta', cleanLoginData.pin_cta)
        .single()

      if (error) {
        console.error('=== ERROR DE LOGIN ===')
        console.error('Error completo:', error)
        console.error('Código:', error.code)
        console.error('Mensaje:', error.message)
        return null
      }

      return data
    } catch (error) {
      console.error('=== ERROR GENERAL DURANTE LOGIN ===')
      console.error('Error:', error)
      return null
    }
  }

  // Función para limpiar y validar datos de entrada
  static cleanAndValidateData(data: any): any {
    const cleaned = { ...data }
    
    // Limpiar strings de espacios y caracteres especiales
    Object.keys(cleaned).forEach(key => {
      if (typeof cleaned[key] === 'string') {
        cleaned[key] = cleaned[key].trim()
        console.log(`Campo ${key}: '${data[key]}' -> '${cleaned[key]}'`)
      }
    })
    
    return cleaned
  }

  // Registro de nueva cuenta
  static async register(registerData: RegisterData): Promise<{ cuenta: CuentaBancaria; titular: any } | null> {
    try {
      
      // Limpiar datos de entrada
      const cleanData = this.cleanAndValidateData(registerData)
      
      // Validar datos de entrada
      if (!cleanData.dni_tit || cleanData.dni_tit.length !== 8) {
        console.error('DNI inválido:', cleanData.dni_tit)
        return null
      }
      
      if (!cleanData.pin_cta || cleanData.pin_cta.length !== 4) {
        console.error('PIN inválido:', cleanData.pin_cta)
        return null
      }

      // Primero crear el titular
      const titularData = {
        nom_tit: cleanData.nom_tit,
        fir_ape_tit: cleanData.fir_ape_tit,
        sec_ape_tit: cleanData.sec_ape_tit,
        dni_tit: cleanData.dni_tit,
        eml_tit: cleanData.eml_tit,
        tlf_tit: cleanData.tlf_tit
      }

      const { data: titular, error: titularError } = await supabase
        .from('titular')
        .insert(titularData)
        .select()
        .single()

      if (titularError) {
        console.error('Error al crear titular:', titularError)
        return null
      }

      // Usar número de cuenta predefinido o generar uno nuevo
      let nro_cta: string
      
      if (cleanData.nro_cta_predefinido) {
        nro_cta = cleanData.nro_cta_predefinido
        
        // Verificar que el número predefinido no exista
        const exists = await this.checkAccountExists(nro_cta)
        if (exists) {
          console.error('El número de cuenta predefinido ya existe:', nro_cta)
          return null
        }
      } else {
        nro_cta = await this.generateUniqueAccountNumber()
      }
      
      const cci_cta = this.generateCCI()

      // Preparar datos de cuenta bancaria
      const cuentaData = {
        idn_tit: titular.idn_tit,
        tpo_cta: cleanData.tpo_cta,
        nro_cta: nro_cta,
        pin_cta: cleanData.pin_cta,
        cci_cta: cci_cta,
        sld_cta: cleanData.saldo_inicial
      }

      console.log('=== CREANDO CUENTA BANCARIA ===')
      console.log('Datos de cuenta a insertar:', cuentaData)

      // Validar datos antes de insertar
      console.log('=== VALIDANDO DATOS DE CUENTA ===')
      console.log('idn_tit tipo:', typeof cuentaData.idn_tit, 'valor:', cuentaData.idn_tit)
      console.log('tpo_cta tipo:', typeof cuentaData.tpo_cta, 'valor:', cuentaData.tpo_cta)
      console.log('nro_cta tipo:', typeof cuentaData.nro_cta, 'valor:', cuentaData.nro_cta, 'longitud:', cuentaData.nro_cta.length)
      console.log('pin_cta tipo:', typeof cuentaData.pin_cta, 'valor:', cuentaData.pin_cta, 'longitud:', cuentaData.pin_cta.length)
      console.log('cci_cta tipo:', typeof cuentaData.cci_cta, 'valor:', cuentaData.cci_cta, 'longitud:', cuentaData.cci_cta.length)
      console.log('sld_cta tipo:', typeof cuentaData.sld_cta, 'valor:', cuentaData.sld_cta)

      // Verificar que los datos cumplan las restricciones
      const validations = {
        idn_tit_exists: !!cuentaData.idn_tit,
        tpo_cta_valid: ['AHORRO', 'CORRIENTE'].includes(cuentaData.tpo_cta),
        nro_cta_valid: /^[0-9]{14}$/.test(cuentaData.nro_cta),
        pin_cta_valid: /^[0-9]{4}$/.test(cuentaData.pin_cta),
        cci_cta_valid: /^[0-9]{20}$/.test(cuentaData.cci_cta),
        sld_cta_valid: cuentaData.sld_cta >= 0
      }
      console.log('Validaciones:', validations)

      // Si alguna validación falla, mostrar detalles
      Object.entries(validations).forEach(([key, valid]) => {
        if (!valid) {
          console.error(`❌ Validación falló: ${key}`)
        } else {
          console.log(`✅ Validación OK: ${key}`)
        }
      })

      // Crear la cuenta bancaria
      const { data: cuenta, error: cuentaError } = await supabase
        .from('cuenta_bancaria')
        .insert(cuentaData)
        .select()
        .single()

      if (cuentaError) {
        console.error('=== ERROR AL CREAR CUENTA BANCARIA ===')
        console.error('Error completo:', cuentaError)
        console.error('Código:', cuentaError.code)
        console.error('Mensaje:', cuentaError.message)
        console.error('Detalles:', cuentaError.details)
        console.error('Hint:', cuentaError.hint)
        
        // Si falla la cuenta, intentamos eliminar el titular para no dejar datos huérfanos
        console.log('Eliminando titular huérfano...')
        await supabase.from('titular').delete().eq('idn_tit', titular.idn_tit)
        
        return null
      }

      console.log('=== CUENTA CREADA EXITOSAMENTE ===')
      console.log('Cuenta:', cuenta)
      
      // VERIFICACIÓN POST-REGISTRO: Buscar la cuenta recién creada
      console.log('=== VERIFICANDO CUENTA RECIÉN CREADA ===')
      const { data: verificacion, error: errorVerif } = await supabase
        .from('cuenta_bancaria')
        .select('*')
        .eq('idn_cta', cuenta.idn_cta)
        .single()

      if (errorVerif) {
        console.error('Error verificando cuenta:', errorVerif)
      } else {
        console.log('Cuenta verificada en BD:', verificacion)
        console.log('Número de cuenta guardado:', verificacion.nro_cta, '(longitud:', verificacion.nro_cta.length, ')')
        console.log('PIN guardado:', verificacion.pin_cta, '(longitud:', verificacion.pin_cta.length, ')')
        
        // Intentar login inmediato con los datos que acabamos de guardar
        console.log('=== PROBANDO LOGIN INMEDIATO ===')
        const loginTest = await this.login({
          nro_cta: verificacion.nro_cta,
          pin_cta: verificacion.pin_cta
        })
        
        if (loginTest) {
          console.log('✅ Login inmediato exitoso')
        } else {
          console.log('❌ Login inmediato falló')
        }
      }
      
      console.log('=== REGISTRO COMPLETO EXITOSO ===')
      return { cuenta, titular }
    } catch (error) {
      console.error('=== ERROR GENERAL DURANTE EL REGISTRO ===')
      console.error('Error:', error)
      return null
    }
  }

  // Obtener información de cuenta
  static async getCuentaInfo(idn_cta: number): Promise<CuentaBancaria | null> {
    try {
      const { data, error } = await supabase
        .from('cuenta_bancaria')
        .select(`
          *,
          titular (*)
        `)
        .eq('idn_cta', idn_cta)
        .single()

      if (error) {
        console.error('Error al obtener cuenta:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error al obtener cuenta:', error)
      return null
    }
  }

  // Actualizar datos del titular (solo email y teléfono)
  static async updateTitular(idn_tit: number, email: string, telefono: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('titular')
        .update({
          eml_tit: email,
          tlf_tit: telefono
        })
        .eq('idn_tit', idn_tit)

      if (error) {
        console.error('Error al actualizar titular:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error al actualizar titular:', error)
      return false
    }
  }

  // Depósito
  static async deposito(idn_tit: number, monto: number): Promise<boolean> {
    try {
      // Crear operación
      const { data: operacion, error: operacionError } = await supabase
        .from('operacion')
        .insert({
          idn_tit: idn_tit
        })
        .select()
        .single()

      if (operacionError) {
        console.error('Error al crear operación:', operacionError)
        return false
      }

      // Crear depósito
      const { error: depositoError } = await supabase
        .from('deposito')
        .insert({
          idn_ope: operacion.idn_ope,
          mnt_dep: monto
        })

      if (depositoError) {
        console.error('Error al crear depósito:', depositoError)
        return false
      }

      // Actualizar saldo
      const { error: saldoError } = await supabase.rpc('actualizar_saldo_deposito', {
        p_idn_tit: idn_tit,
        p_monto: monto
      })

      if (saldoError) {
        console.error('Error al actualizar saldo:', saldoError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error en depósito:', error)
      return false
    }
  }

  // Retiro
  static async retiro(idn_tit: number, monto: number): Promise<boolean> {
    try {
      // Verificar saldo suficiente
      const { data: cuenta } = await supabase
        .from('cuenta_bancaria')
        .select('sld_cta')
        .eq('idn_tit', idn_tit)
        .single()

      if (!cuenta || cuenta.sld_cta < monto) {
        return false
      }

      // Crear operación
      const { data: operacion, error: operacionError } = await supabase
        .from('operacion')
        .insert({
          idn_tit: idn_tit
        })
        .select()
        .single()

      if (operacionError) {
        console.error('Error al crear operación:', operacionError)
        return false
      }

      // Crear retiro
      const { error: retiroError } = await supabase
        .from('retiro')
        .insert({
          idn_ope: operacion.idn_ope,
          mnt_ret: monto
        })

      if (retiroError) {
        console.error('Error al crear retiro:', retiroError)
        return false
      }

      // Actualizar saldo
      const { error: saldoError } = await supabase.rpc('actualizar_saldo_retiro', {
        p_idn_tit: idn_tit,
        p_monto: monto
      })

      if (saldoError) {
        console.error('Error al actualizar saldo:', saldoError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error en retiro:', error)
      return false
    }
  }

  // Obtener historial de operaciones
  static async getHistorial(idn_tit: number): Promise<OperacionCompleta[]> {
    try {
      const { data, error } = await supabase
        .from('operacion')
        .select(`
          *,
          deposito (*),
          retiro (*),
          transferencia (*)
        `)
        .eq('idn_tit', idn_tit)
        .order('fch_ope', { ascending: false })

      if (error) {
        console.error('Error al obtener historial:', error)
        return []
      }

      return data.map(op => ({
        ...op,
        tipo: op.deposito ? 'DEPOSITO' : op.retiro ? 'RETIRO' : 'TRANSFERENCIA',
        monto: op.deposito?.mnt_dep || op.retiro?.mnt_ret || op.transferencia?.mnt_trs || 0
      }))
    } catch (error) {
      console.error('Error al obtener historial:', error)
      return []
    }
  }
}