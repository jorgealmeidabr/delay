// Sistema de Missão de Convites
// Persistência em localStorage

export interface InviteRecord {
  code: string;          // Código único do visitante (ex: A8X4P9)
  visitorId: string;     // Fingerprint do browser do dono do link
  visitorName?: string;  // Preenchido quando envia solicitação
  visits: InviteVisit[]; // Histórico de visitas válidas
  goalMet: boolean;      // Meta atingida?
  requestSent: boolean;  // Solicitação enviada?
  requestApproved: boolean;
  requestRejected: boolean;
  createdAt: string;
}

export interface InviteVisit {
  id: string;
  visitorFingerprint: string; // Fingerprint do visitante (quem clicou)
  timestamp: string;
}

// --- Config Keys ---
const MISSION_ACTIVE_KEY = 'mission_active';
const MISSION_GOAL_KEY = 'mission_goal';
const MISSION_DEST_KEY = 'mission_dest_link';
const MISSION_MSG_KEY = 'mission_message';
const INVITE_RECORDS_KEY = 'invite_records';
const MY_INVITE_CODE_KEY = 'my_invite_code';
const MY_FINGERPRINT_KEY = 'my_browser_fingerprint';

// --- Browser Fingerprint (leve) ---
export function getBrowserFingerprint(): string {
  const stored = localStorage.getItem(MY_FINGERPRINT_KEY);
  if (stored) return stored;

  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
  ].join('|');

  // Hash simples (djb2)
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  const fp = 'fp_' + Math.abs(hash).toString(36);
  localStorage.setItem(MY_FINGERPRINT_KEY, fp);
  return fp;
}

// --- Gerar código único ---
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// --- Obter todos os registros ---
export function getAllInviteRecords(): InviteRecord[] {
  try {
    return JSON.parse(localStorage.getItem(INVITE_RECORDS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAllRecords(records: InviteRecord[]) {
  localStorage.setItem(INVITE_RECORDS_KEY, JSON.stringify(records));
}

// --- Obter ou criar o registro do visitante atual (dono do link) ---
export function getOrCreateMyInvite(): InviteRecord {
  const myFp = getBrowserFingerprint();
  const records = getAllInviteRecords();
  const existing = records.find(r => r.visitorId === myFp);
  if (existing) return existing;

  // Garantir código único
  let code: string;
  const existingCodes = new Set(records.map(r => r.code));
  do { code = generateCode(); } while (existingCodes.has(code));

  const newRecord: InviteRecord = {
    code,
    visitorId: myFp,
    visits: [],
    goalMet: false,
    requestSent: false,
    requestApproved: false,
    requestRejected: false,
    createdAt: new Date().toISOString(),
  };
  records.push(newRecord);
  saveAllRecords(records);
  localStorage.setItem(MY_INVITE_CODE_KEY, code);
  return newRecord;
}

// --- Registrar uma visita em um código (chamado pelo Redirect) ---
export function registerVisit(code: string): { success: boolean; redirectUrl: string } {
  const destLink = localStorage.getItem(MISSION_DEST_KEY) || window.location.origin;
  const records = getAllInviteRecords();
  const idx = records.findIndex(r => r.code === code);

  if (idx === -1) {
    // Código inválido — redireciona de qualquer forma
    return { success: false, redirectUrl: destLink };
  }

  const record = records[idx];
  const visitorFp = getBrowserFingerprint();

  // Anti-fraude: não contar o próprio dono do link
  if (record.visitorId === visitorFp) {
    return { success: false, redirectUrl: destLink };
  }

  // Anti-fraude: não contar visitante duplicado
  const alreadyCounted = record.visits.some(v => v.visitorFingerprint === visitorFp);
  if (alreadyCounted) {
    return { success: false, redirectUrl: destLink };
  }

  // Visita válida!
  const visit: InviteVisit = {
    id: 'v_' + Date.now(),
    visitorFingerprint: visitorFp,
    timestamp: new Date().toISOString(),
  };
  record.visits.push(visit);

  // Verificar meta
  const goal = parseInt(localStorage.getItem(MISSION_GOAL_KEY) || '2');
  if (record.visits.length >= goal) {
    record.goalMet = true;
  }

  records[idx] = record;
  saveAllRecords(records);

  return { success: true, redirectUrl: destLink };
}

// --- Marcar solicitação enviada ---
export function markRequestSent(code: string, name: string) {
  const records = getAllInviteRecords();
  const idx = records.findIndex(r => r.code === code);
  if (idx === -1) return;
  records[idx].requestSent = true;
  records[idx].visitorName = name;
  saveAllRecords(records);
}

// --- Configurações da Missão ---
export function getMissionConfig() {
  return {
    active: localStorage.getItem(MISSION_ACTIVE_KEY) === 'true',
    goal: parseInt(localStorage.getItem(MISSION_GOAL_KEY) || '2'),
    destLink: localStorage.getItem(MISSION_DEST_KEY) || '',
    message: localStorage.getItem(MISSION_MSG_KEY) || 'Convide {meta} pessoas para acessar este link e desbloqueie sua solicitação de acesso.',
  };
}

export function saveMissionConfig(config: { active: boolean; goal: number; destLink: string; message: string }) {
  localStorage.setItem(MISSION_ACTIVE_KEY, String(config.active));
  localStorage.setItem(MISSION_GOAL_KEY, String(config.goal));
  localStorage.setItem(MISSION_DEST_KEY, config.destLink);
  localStorage.setItem(MISSION_MSG_KEY, config.message);
}

// --- Métricas para o Dashboard ---
export function getMissionStats(filter?: 'today' | '7d' | '30d' | '90d') {
  const records = getAllInviteRecords();
  const now = Date.now();
  const filterMs: Record<string, number> = {
    today: 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

  const filtered = filter
    ? records.filter(r => now - new Date(r.createdAt).getTime() <= filterMs[filter])
    : records;

  const totalLinks = filtered.length;
  const totalValidVisits = filtered.reduce((sum, r) => sum + r.visits.length, 0);
  const totalGoalMet = filtered.filter(r => r.goalMet).length;
  const totalRequestsSent = filtered.filter(r => r.requestSent).length;
  const totalApproved = filtered.filter(r => r.requestApproved).length;
  const conversionRate = totalLinks > 0 ? ((totalRequestsSent / totalLinks) * 100).toFixed(1) : '0.0';

  const ranking = [...filtered]
    .sort((a, b) => b.visits.length - a.visits.length)
    .slice(0, 10)
    .map(r => ({
      code: r.code,
      name: r.visitorName || '—',
      visits: r.visits.length,
      goalMet: r.goalMet,
      requestSent: r.requestSent,
      approved: r.requestApproved,
      rejected: r.requestRejected,
      createdAt: r.createdAt,
      status: r.requestApproved ? 'Aprovado' : r.requestRejected ? 'Rejeitado' : r.requestSent ? 'Concluído' : r.goalMet ? 'Concluído' : 'Em andamento',
    }));

  return {
    totalLinks,
    totalValidVisits,
    totalGoalMet,
    totalRequestsSent,
    totalApproved,
    conversionRate,
    ranking,
    records: filtered,
  };
}
