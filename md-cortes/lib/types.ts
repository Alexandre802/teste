/** Tipos do domínio. Espelham as tabelas de `supabase/schema.sql`. */

export type Role = 'developer' | 'employee';

export type PaymentMethod = 'pix' | 'dinheiro' | 'debito' | 'credito';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** "Desenvolvedor", "Funcionário 1", "Funcionário 2". */
  jobTitle: string | null;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  defaultPrice: number;
  active: boolean;
  sortOrder: number;
}

export interface Haircut {
  id: string;
  employeeId: string;
  employeeName: string;
  serviceId: string | null;
  serviceName: string;
  price: number;
  paymentMethod: PaymentMethod;
  /** ISO 8601 com fuso. O corte de 23h50 em São Paulo pertence ao dia de lá. */
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  employeeId: string | null;
  haircutId: string | null;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NewHaircut {
  serviceId: string | null;
  serviceName: string;
  price: number;
  paymentMethod: PaymentMethod;
}

/** Um dia da série do gráfico. */
export interface DayPoint {
  /** 'YYYY-MM-DD' no fuso de São Paulo. */
  dayKey: string;
  label: string;
  count: number;
  revenue: number;
}

export interface HaircutRange {
  from: Date;
  to: Date;
  employeeId?: string;
}
