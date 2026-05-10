/**
 * localStorage.ts
 * Gestor de persistencia local para Elda Circular
 * Maneja Elda-Coins, Pegatina Roja y datos de usuario sin depender de servidores
 */

interface UserData {
  id: string;
  nombre: string;
  email: string;
  eldaCoins: number;
  pegatina: 'verde' | 'amarilla' | 'roja';
  nivelEducativo: 'primaria' | 'secundaria' | 'universidad' | 'none';
  quizzesCompletados: string[];
  actividadesRegistradas: Activity[];
  fechaRegistro: string;
  ultimaActualizacion: string;
}

interface Activity {
  id: string;
  tipo: string;
  fecha: string;
  puntos: number;
  descripcion: string;
}

interface LocalStorageConfig {
  version: string;
  usuariosRegistrados: number;
  eldaCoinsDistribuidos: number;
}

/**
 * Inicializar localStorage con estructura base
 */
export const initializeStorage = (): void => {
  const config = localStorage.getItem('elda-config');

  if (!config) {
    const initialConfig: LocalStorageConfig = {
      version: '1.0.0',
      usuariosRegistrados: 0,
      eldaCoinsDistribuidos: 0,
    };
    localStorage.setItem('elda-config', JSON.stringify(initialConfig));
    console.log('✅ localStorage inicializado para Elda Circular');
  }
};

/**
 * Crear nuevo usuario
 */
export const createUser = (
  id: string,
  nombre: string,
  email: string
): UserData => {
  const newUser: UserData = {
    id,
    nombre,
    email,
    eldaCoins: 0,
    pegatina: 'verde',
    nivelEducativo: 'none',
    quizzesCompletados: [],
    actividadesRegistradas: [],
    fechaRegistro: new Date().toISOString(),
    ultimaActualizacion: new Date().toISOString(),
  };

  localStorage.setItem(`user-${id}`, JSON.stringify(newUser));

  // Actualizar contador
  const config = JSON.parse(
    localStorage.getItem('elda-config') || '{}'
  ) as LocalStorageConfig;
  config.usuariosRegistrados++;
  localStorage.setItem('elda-config', JSON.stringify(config));

  return newUser;
};

/**
 * Obtener datos de usuario
 */
export const getUser = (userId: string): UserData | null => {
  const userData = localStorage.getItem(`user-${userId}`);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Actualizar Elda-Coins
 */
export const updateEldaCoins = (
  userId: string,
  cantidad: number,
  razon: string
): boolean => {
  const user = getUser(userId);

  if (!user) {
    console.error('❌ Usuario no encontrado');
    return false;
  }

  user.eldaCoins += cantidad;
  user.ultimaActualizacion = new Date().toISOString();

  // Registrar actividad
  const activity: Activity = {
    id: `activity-${Date.now()}`,
    tipo: 'coin-transaction',
    fecha: new Date().toISOString(),
    puntos: cantidad,
    descripcion: razon,
  };

  user.actividadesRegistradas.push(activity);

  localStorage.setItem(`user-${userId}`, JSON.stringify(user));

  // Actualizar distribución total
  const config = JSON.parse(
    localStorage.getItem('elda-config') || '{}'
  ) as LocalStorageConfig;
  config.eldaCoinsDistribuidos += cantidad;
  localStorage.setItem('elda-config', JSON.stringify(config));

  console.log(`✅ ${cantidad} EC añadido a ${user.nombre}`);
  return true;
};

/**
 * Actualizar Pegatina Roja
 */
export const updatePegatina = (
  userId: string,
  estado: 'verde' | 'amarilla' | 'roja'
): boolean => {
  const user = getUser(userId);

  if (!user) {
    console.error('❌ Usuario no encontrado');
    return false;
  }

  user.pegatina = estado;
  user.ultimaActualizacion = new Date().toISOString();

  // Registrar actividad
  const activity: Activity = {
    id: `activity-${Date.now()}`,
    tipo: 'pegatina-update',
    fecha: new Date().toISOString(),
    puntos: 0,
    descripcion: `Pegatina actualizada a: ${estado.toUpperCase()}`,
  };

  user.actividadesRegistradas.push(activity);

  localStorage.setItem(`user-${userId}`, JSON.stringify(user));

  console.log(`🔴 Pegatina de ${user.nombre} ahora es: ${estado}`);
  return true;
};

/**
 * Registrar quiz completado
 */
export const markQuizCompleted = (userId: string, quizId: string): boolean => {
  const user = getUser(userId);

  if (!user) {
    console.error('❌ Usuario no encontrado');
    return false;
  }

  if (!user.quizzesCompletados.includes(quizId)) {
    user.quizzesCompletados.push(quizId);
    user.ultimaActualizacion = new Date().toISOString();

    // Registrar actividad
    const activity: Activity = {
      id: `activity-${Date.now()}`,
      tipo: 'quiz-completed',
      fecha: new Date().toISOString(),
      puntos: 50,
      descripcion: `Quiz completado: ${quizId}`,
    };

    user.actividadesRegistradas.push(activity);

    localStorage.setItem(`user-${userId}`, JSON.stringify(user));
    console.log(`✅ Quiz ${quizId} registrado como completado`);
    return true;
  }

  return false;
};

/**
 * Obtener historial de actividades
 */
export const getActivityHistory = (userId: string): Activity[] => {
  const user = getUser(userId);
  return user ? user.actividadesRegistradas : [];
};

/**
 * Exportar datos para auditoría
 */
export const exportUserDataForAudit = (userId: string): string => {
  const user = getUser(userId);
  if (!user) {
    console.error('❌ Usuario no encontrado para auditoría');
    return '';
  }

  return JSON.stringify(user, null, 2);
};

/**
 * Sincronizar datos con servidor (cuando esté disponible)
 */
export const syncWithServer = async (userId: string): Promise<boolean> => {
  const user = getUser(userId);

  if (!user) {
    console.error('❌ Usuario no encontrado para sincronización');
    return false;
  }

  try {
    // Placeholder para integración futura
    console.log(`🔄 Sincronizando datos de ${user.nombre}...`);
    // const response = await fetch('/api/sync', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(user),
    // });
    // return response.ok;
    return true;
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return false;
  }
};

/**
 * Obtener estadísticas globales
 */
export const getGlobalStats = () => {
  const config = localStorage.getItem('elda-config');
  return config ? JSON.parse(config) : null;
};

/**
 * Limpiar datos (solo para testing)
 */
export const clearStorage = (): void => {
  if (confirm('⚠️ ¿Estás seguro de que deseas limpiar todos los datos?')) {
    localStorage.clear();
    console.log('✅ Almacenamiento limpiado');
  }
};
