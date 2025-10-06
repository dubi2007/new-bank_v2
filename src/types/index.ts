export interface Titular {
  idn_tit: number;
  nom_tit: string;
  fir_ape_tit: string;
  sec_ape_tit: string;
  dni_tit: string;
  eml_tit: string;
  tlf_tit: string;
  fch_reg: string;
}

export interface CuentaBancaria {
  idn_cta: number;
  idn_tit: number;
  tpo_cta: 'AHORRO' | 'CORRIENTE';
  nro_cta: string; // 14 digits
  pin_cta: string; // 4 digits
  cci_cta: string; // 20 digits
  sld_cta: number;
  fch_reg: string;
  titular?: Titular;
}

export interface Operacion {
  idn_ope: number;
  idn_tit: number;
  fch_ope: string;
}

export interface Deposito {
  idn_ope: number;
  mnt_dep: number;
}

export interface Retiro {
  idn_ope: number;
  mnt_ret: number;
}

export interface Transferencia {
  idn_ope: number;
  idn_tit_des: number;
  mnt_trs: number;
}

export interface OperacionCompleta extends Operacion {
  deposito?: Deposito;
  retiro?: Retiro;
  transferencia?: Transferencia;
  tipo: 'DEPOSITO' | 'RETIRO' | 'TRANSFERENCIA';
  monto: number;
}

export interface LoginData {
  nro_cta: string;
  pin_cta: string;
}

export interface RegisterData {
  nom_tit: string;
  fir_ape_tit: string;
  sec_ape_tit: string;
  dni_tit: string;
  eml_tit: string;
  tlf_tit: string;
  tpo_cta: 'AHORRO' | 'CORRIENTE';
  pin_cta: string;
  saldo_inicial: number;
  nro_cta_predefinido?: string; // Número de cuenta predefinido opcional
}