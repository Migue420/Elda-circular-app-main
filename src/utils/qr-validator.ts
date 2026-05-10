/**
 * qr-validator.ts
 * Validador de códigos QR para Elda Circular
 * Asigna Pegatina Roja basada en validación de contenedor
 */

export interface QRData {
  codigo: string;
  contenedor: string;
  zona: string;
  tipo: 'organica' | 'envases' | 'resto';
  timestamp: string;
  digitoVerificacion: string;
}

export interface ValidationResult {
  valido: boolean;
  pegatina: 'verde' | 'amarilla' | 'roja';
  mensaje: string;
  puntosOtenidos: number;
  detalles: ValidationDetail[];
}

interface ValidationDetail {
  aspecto: string;
  estado: 'ok' | 'warning' | 'error';
  descripcion: string;
}

/**
 * Validar código QR y contenedor
 */
export const validateQRCode = (
  qrContent: string,
  contenedorFoto?: Blob
): ValidationResult => {
  const detalles: ValidationDetail[] = [];
  let pegatina: 'verde' | 'amarilla' | 'roja' = 'verde';
  let puntosObtenidos = 0;

  try {
    // 1. Validar formato del QR
    const qrData = parseQRData(qrContent);
    if (!qrData) {
      return {
        valido: false,
        pegatina: 'roja',
        mensaje: '❌ Código QR inválido o corrupto',
        puntosOtenidos: 0,
        detalles: [
          {
            aspecto: 'Formato QR',
            estado: 'error',
            descripcion: 'El código no cumple el formato esperado',
          },
        ],
      };
    }

    detalles.push({
      aspecto: 'Formato QR',
      estado: 'ok',
      descripcion: `✅ Código válido: ${qrData.contenedor}`,
    });

    // 2. Validar dígito de verificación
    const digitoValido = validateCheckDigit(qrData.codigo);
    if (!digitoValido) {
      pegatina = 'amarilla';
      detalles.push({
        aspecto: 'Dígito Verificación',
        estado: 'warning',
        descripcion: '⚠️ Dígito de verificación incorrecto (posible QR dañado)',
      });
    } else {
      detalles.push({
        aspecto: 'Dígito Verificación',
        estado: 'ok',
        descripcion: '✅ Dígito de verificación correcto',
      });
      puntosObtenidos += 5;
    }

    // 3. Validar contenedor visualmente (si se proporciona foto)
    if (contenedorFoto) {
      const contenedorValido = validateContainerVisually(
        contenedorFoto,
        qrData.tipo
      );
      if (!contenedorValido) {
        pegatina = 'roja';
        detalles.push({
          aspecto: 'Tipo Contenedor',
          estado: 'error',
          descripcion: `❌ El contenedor no es de tipo ${qrData.tipo}`,
        });
      } else {
        detalles.push({
          aspecto: 'Tipo Contenedor',
          estado: 'ok',
          descripcion: `✅ Contenedor ${qrData.tipo} validado`,
        });
        puntosObtenidos += 10;
      }
    }

    // 4. Validar limpieza del residuo
    const residuoLimpio = validateResidueQuality(qrData.tipo);
    if (!residuoLimpio) {
      pegatina = 'roja';
      detalles.push({
        aspecto: 'Limpieza Residuo',
        estado: 'error',
        descripcion: '❌ El residuo presenta contaminación',
      });
    } else {
      detalles.push({
        aspecto: 'Limpieza Residuo',
        estado: 'ok',
        descripcion: '✅ Residuo limpio y separado correctamente',
      });
      puntosObtenidos += 5;
    }

    // 5. Validar horario
    const horarioValido = validateSchedule(qrData.tipo, qrData.timestamp);
    if (!horarioValido) {
      pegatina = 'amarilla';
      detalles.push({
        aspecto: 'Horario',
        estado: 'warning',
        descripcion: `⚠️ Fuera de horario recomendado para ${qrData.tipo}`,
      });
    } else {
      detalles.push({
        aspecto: 'Horario',
        estado: 'ok',
        descripcion: '✅ Horario correcto para recogida',
      });
      puntosObtenidos += 5;
    }

    // Mensaje final
    let mensaje = '';
    if (pegatina === 'verde') {
      mensaje = '✅ ¡Excelente! Separación correcta. +' + puntosObtenidos + ' EC';
    } else if (pegatina === 'amarilla') {
      mensaje = '⚠️ Separación con algunos detalles a mejorar';
    } else {
      mensaje = '❌ Rechazo: Se requiere nueva separación';
    }

    return {
      valido: pegatina !== 'roja',
      pegatina,
      mensaje,
      puntosOtenidos,
      detalles,
    };
  } catch (error) {
    console.error('Error al validar QR:', error);
    return {
      valido: false,
      pegatina: 'roja',
      mensaje: '❌ Error al procesar la validación',
      puntosOtenidos: 0,
      detalles: [
        {
          aspecto: 'Sistema',
          estado: 'error',
          descripcion: 'Error interno en validación',
        },
      ],
    };
  }
};

/**
 * Parsear contenido del código QR
 */
function parseQRData(qrContent: string): QRData | null {
  try {
    // Formato esperado: ELDA-XX-ZONA-TIPO-TIMESTAMP-DIGITO
    const parts = qrContent.split('-');

    if (
      parts.length < 6 ||
      parts[0].toUpperCase() !== 'ELDA'
    ) {
      return null;
    }

    const tipo = parts[3].toLowerCase() as
      | 'organica'
      | 'envases'
      | 'resto';
    if (!['organica', 'envases', 'resto'].includes(tipo)) {
      return null;
    }

    return {
      codigo: qrContent,
      contenedor: `${parts[1]}-${parts[2]}`,
      zona: parts[2],
      tipo,
      timestamp: parts[4],
      digitoVerificacion: parts[5],
    };
  } catch {
    return null;
  }
}

/**
 * Validar dígito de verificación (Luhn algorithm)
 */
function validateCheckDigit(codigo: string): boolean {
  const digitos = codigo.replace(/[^\d]/g, '');
  if (digitos.length === 0) return false;

  let suma = 0;
  for (let i = 0; i < digitos.length - 1; i++) {
    let digito = parseInt(digitos[i], 10);
    if (i % 2 === 0) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
  }

  const digitoEsperado = (10 - (suma % 10)) % 10;
  const digitoReal = parseInt(digitos[digitos.length - 1], 10);

  return digitoEsperado === digitoReal;
}

/**
 * Validar contenedor visualmente (placeholder)
 */
function validateContainerVisually(
  foto: Blob,
  tipo: 'organica' | 'envases' | 'resto'
): boolean {
  // Placeholder para visión por computadora
  // En producción: usar ML para detectar color del contenedor
  console.log(`📸 Validando contenedor ${tipo}...`);
  return true; // Por ahora, asumir válido
}

/**
 * Validar limpieza del residuo
 */
function validateResidueQuality(tipo: string): boolean {
  // Placeholder para análisis de limpieza
  console.log(`🔍 Validando limpieza de ${tipo}...`);
  return true; // Por ahora, asumir válido
}

/**
 * Validar horario de recogida
 */
function validateSchedule(
  tipo: 'organica' | 'envases' | 'resto',
  timestamp: string
): boolean {
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0=domingo, 1=lunes, etc.
  const hora = ahora.getHours();

  const horarios: Record<string, number[]> = {
    organica: [1, 3, 5], // Lunes, Miércoles, Viernes
    envases: [2, 4], // Martes, Jueves
    resto: [1, 4], // Lunes, Jueves
  };

  const diasPermitidos = horarios[tipo] || [];
  const dentro_horario = hora >= 8 && hora <= 20; // Entre 8 y 20 horas

  return diasPermitidos.includes(diaSemana) && dentro_horario;
}

/**
 * Generar nuevo código QR para contenedor
 */
export const generateQRCode = (
  contenedor: string,
  zona: string,
  tipo: 'organica' | 'envases' | 'resto'
): string => {
  const timestamp = Date.now().toString();
  const numero = Math.floor(Math.random() * 100);
  const digito = Math.floor(Math.random() * 10);

  const codigo = `ELDA-${numero}-${zona}-${tipo}-${timestamp}-${digito}`;
  return codigo;
};
