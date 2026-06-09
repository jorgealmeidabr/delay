import { v4 as uuidv4 } from 'uuid';

export interface AuditLog {
  id: string;
  timestamp: string;
  usuario: string;
  role: 'admin' | 'usuario' | 'sistema';
  modulo: string;
  acao: string;
  registroAfetado: string;
  valorAnterior?: string;
  valorNovo?: string;
  ip: string;
  navegador: string;
}

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Desconhecido';
};

export const logAction = (
  modulo: string,
  acao: string,
  registroAfetado: string,
  valorAnterior?: string,
  valorNovo?: string
) => {
  try {
    const logsStr = localStorage.getItem('audit_logs') || '[]';
    const logs: AuditLog[] = JSON.parse(logsStr);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const newLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      usuario: user ? user.email : 'Sistema',
      role: user ? user.role : 'sistema',
      modulo,
      acao,
      registroAfetado,
      valorAnterior,
      valorNovo,
      ip: '127.0.0.1', // Simulated IP since it's a front-end only app
      navegador: getBrowserInfo()
    };

    logs.unshift(newLog); // Add to beginning
    localStorage.setItem('audit_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Falha ao gravar log de auditoria', error);
  }
};

export const getLogs = (): AuditLog[] => {
  try {
    const logsStr = localStorage.getItem('audit_logs') || '[]';
    return JSON.parse(logsStr);
  } catch (error) {
    return [];
  }
};

export const getLogsByRecord = (registroAfetado: string): AuditLog[] => {
  const logs = getLogs();
  return logs.filter(log => log.registroAfetado === registroAfetado);
};
