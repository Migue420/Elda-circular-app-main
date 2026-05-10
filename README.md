# 🌍 Elda Circular - Civic OS

> **La Basura es Rentable. Elda lo Demuestra.**

## 📱 Una PWA para la Economía Circular Municipal

**Elda Circular** es una Aplicación Web Progresiva (PWA) que transforma la gestión de residuos en un sistema de educación, participación ciudadana y reconocimiento comunitario. Alianza estratégica entre el Ayuntamiento de Elda y VAERSA para implementar la **Ley 7/2022** de economía circular.

---

## 🎯 Misión

Convertir Elda en referencia nacional de **"Civic OS"** (Sistema Operativo Cívico) donde:
- ✅ Ciudadanos aprenden separando
- ✅ Municipio ahorra **+90€ por tonelada**
- ✅ VAERSA valida trazabilidad completa
- ✅ Meritocracia circular recompensa responsabilidad

---

## 🚀 Características Principales

### 1. **Educación Circular Gamificada (Z-ero)**
Tres niveles de cuestionarios interactivos:
- 📚 **Primaria**: Fundamentos de reciclaje (6-12 años)
- 🔬 **Secundaria**: Técnica y sostenibilidad (12-18 años)
- 🎓 **Universidad**: Modelos de negocio circular (18+ años)

**Recompensas**: Elda-Coins canjeables por servicios municipales

### 2. **Trazabilidad Audiovisual (Viernes de Trazabilidad)**
- 📹 Videos educativos de seguimiento de residuos
- 🎥 Documentales sobre impacto ambiental del Medio Vinalopó
- 🎵 Podcasts informativos: "La Rentabilidad de la Basura"

### 3. **Sistema QR + Pegatina Roja**
- Escanear para validar separación correcta
- Estado: Verde (✓) | Amarilla (⚠️) | Roja (✗)
- Basado en LocalStorage (sin dependencia de servidores en fase piloto)

### 4. **Calendario Mono-Producto**
Rutas organizadas por tipo:
- 🟤 **Orgánica** (Lunes, Miércoles, Viernes)
- 🟨 **Envases** (Martes, Jueves)
- ⚫ **Resto** (Lunes, Jueves)

### 5. **Identidad Visual Boogie Pop Art**
Diseño vibrante con:
- Glifos de Lucide Icons
- Paleta de colores circular
- Animaciones educativas

---

## 📂 Estructura del Proyecto

```
Elda-circular-app/
├── docs/                          # 📋 Documentación Estratégica
│   ├── README.md                  # Libro Blanco
│   ├── Propuesta_Tecnica_*.pdf    # Artefacto 5 - Contrato VAERSA
│   ├── Manual_Educador_*.pdf      # Artefacto 8
│   └── Presentaciones/            # Artefactos 1, 12, 13
│
├── public/media/                  # 🎬 Contenido Multimedia
│   ├── tutorials/                 # Vídeos educativos (Artefactos 7, 9, 11)
│   ├── education/                 # Viernes Trazabilidad (Artefacto 2)
│   └── audio/                     # Podcast (Artefacto 6)
│
├── src/
│   ├── assets/images/
│   │   └── boogie-art/            # 🎨 Infografías (Artefactos 3, 4, 10)
│   │
│   ├── components/
│   │   ├── layout/                # Estructura de la App
│   │   └── features/              # Módulos: Quiz, QR, Calendario
│   │
│   ├── data/                      # 📊 Lógica de Negocio
│   │   ├── calendario.json        # Rutas mono-producto
│   │   ├── quizzes/
│   │   │   ├── primaria.json      # Z-ero Nivel 1
│   │   │   ├── secundaria.json    # Z-ero Nivel 2
│   │   │   └── universidad.json   # Z-ero Nivel 3
│   │   ├── elda-coins-config.json # Sistema de recompensas
│   │   └── pegatina-roja.json     # Validación ciudadana
│   │
│   └── utils/
│       ├── localStorage.ts        # Persistencia local
│       ├── qr-validator.ts        # Validación QR
│       └── coins-manager.ts       # Gestión de Elda-Coins
│
└── README.md                      # Este archivo
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|-----------|-----|
| **TypeScript** | Lógica robusta y tipada |
| **React** | Interfaz reactiva |
| **Vite** | Build ultra rápido |
| **Tailwind CSS** | Diseño boogie pop art |
| **PWA** | Funciona offline |
| **LocalStorage** | Persistencia sin servidor |
| **QR Code Libs** | Validación de contenedores |

---

## 📊 Métricas de Impacto

### Fase Piloto (2026)
- 🎯 **Meta de Participación**: 80% ciudadanos
- 💰 **Ahorro Estimado**: €45,000/mes
- 🌱 **Reducción de Emisiones**: 45%
- ♻️ **Toneladas Circuladas**: 1,500+ (objetivo)

### ROI Elda-VAERSA
- **Inversión**: Fase piloto gratuita
- **Retorno**: +90€/tonelada gestionada
- **Timeline**: Rentabilidad en 6 meses

---

## 🔐 Seguridad y Privacidad

### Persistencia sin Servidor
```typescript
// Fase 1: LocalStorage seguro
localStorage.setItem('elda-coins', JSON.stringify(userData));

// Fase 2: Blockchain para auditoría
qrCode.validate() → firma digital → blockchain
```

### Pegatina Roja (Validación Ciudadana)
- ✅ Verde: Separación correcta
- ⚠️ Amarilla: Contaminación detectada
- ❌ Roja: Requiere inspección

**Sin dependencia de servidores centralizados en piloto.**

---

## 🎓 Cuestionarios Z-ero

### Primaria (6-12 años)
```json
{
  "modulos": ["Qué son residuos", "Reciclaje en Elda", "Elda-Coins"]
  "puntos_max": 100
  "recompensa": "Guardián Ecológico (50 EC)"
}
```

### Secundaria (12-18 años)
```json
{
  "modulos": ["Economía Circular", "Trazabilidad QR", "Impacto Ambiental"]
  "puntos_max": 100
  "recompensa": "Especialista Circular (150 EC)"
}
```

### Universidad (18+ años)
```json
{
  "modulos": ["Modelo Negocio", "Blockchain", "Ley 7/2022"]
  "puntos_max": 100
  "recompensa": "Investigador Circular (300 EC + certificado)"
}
```

---

## 📱 Funcionalidades Principales

### 1️⃣ Escanear QR
```
Usuario → Escanea código → App valida → Pegatina + Elda-Coins
```

### 2️⃣ Ver Calendario
```
Menú → "Mi Ruta" → Filtra por zona → Horarios actualizado
```

### 3️⃣ Completar Quiz
```
"Educación" → Elige nivel → Contesta preguntas → Gana EC
```

### 4️⃣ Ver Mi Progreso
```
"Dashboard" → Estadísticas personales + ranking comunitario
```

---

## 🌐 Integración Multimedia

### Vídeos Tutoriales
- **Artefacto 7, 9, 11**: Cómo usar la app y el sistema QR
- Ubicación: `/public/media/tutorials/`

### Viernes de Trazabilidad
- **Artefacto 2**: Documentales educativos para colegios
- Ubicación: `/public/media/education/`

### Audio Overview
- **Artefacto 6**: Podcast sobre rentabilidad circular
- Ubicación: `/public/media/audio/`

### Infografías (Boogie Pop Art)
- **Artefactos 3, 4, 10**: Cronología, mapa mental, datos
- Ubicación: `/src/assets/images/boogie-art/`

---

## 🏛️ Cumplimiento Normativo

✅ **Ley 7/2022** - Protocolo de economía circular
✅ **Auditoría VAERSA** - Trazabilidad completa
✅ **GDPR** - Privacidad de datos (LocalStorage)
✅ **Accesibilidad WCAG 2.1** - Inclusión digital

**Documentación**: Ver carpeta `/docs/`

---

## 🚀 Cómo Empezar

### Instalación
```bash
git clone https://github.com/Migue420/Elda-circular-app.git
cd Elda-circular-app
npm install
npm run dev
```

### Desarrollo
```bash
npm run dev      # Servidor local con HMR
npm run build    # Producción
npm run preview  # Vista previa de build
```

### Testing
```bash
npm run test     # Suite de tests
npm run lint     # Validar código
```

---

## 📋 Roadmap 2026

| Fase | Mes | Objetivo |
|------|-----|----------|
| **Piloto** | Mayo-Junio | 500 usuarios, validar UX |
| **Beta** | Julio-Agosto | 5,000 usuarios, estabilidad |
| **Producción** | Septiembre | Lanzamiento municipal |
| **Escalado** | Oct-Dic | Integración con VAERSA |

---

## 👥 Stakeholders

| Grupo | Beneficio |
|-------|----------|
| 🏠 **Ciudadanos** | Recompensas + educación |
| 🏛️ **Municipio** | Ahorro +90€/ton |
| 🏭 **VAERSA** | Trazabilidad verificada |
| 🎓 **Educadores** | Plataforma pedagógica |
| 🌍 **Comunidad** | Impacto ambiental medible |

---

## 📞 Contacto y Soporte

- **Municipio de Elda**: innovacion@elda.es
- **VAERSA**: info@vaersa.com
- **Equipo Técnico**: Migue420@github.com

---

## 📄 Licencia

Este proyecto está bajo **licencia municipal abierta** para la educación y sostenibilidad comunitaria.

---

## 🎉 Agradecimientos

- 🏛️ Ayuntamiento de Elda por la visión circular
- 🏭 VAERSA por la validación técnica
- 🎨 Comunidad de diseño Boogie Pop Art
- 👥 Ciudadanos de Elda por la participación

---

**Elda Circular: Transformando la Basura en Valor 🌍♻️💚**

*Last updated: 2026-05-09*
