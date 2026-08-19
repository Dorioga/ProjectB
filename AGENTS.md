# AGENTS.md — Guía para agentes de IA

Guía rápida para trabajar en este repositorio. Para documentación técnica y de vistas, ver [`README.md`](./README.md); para el usuario final, [`manual.md`](./manual.md).

## 1. Qué es

**Nexus** (`ProjectB`) es una SPA de gestión educativa (estudiantes, docentes, sedes, notas, asistencia, boletines, auditoría) con un backend REST externo. Incluye además un **módulo de Cursos educativos interactivos** (anatomía 3D, matemáticas y química) construido con `three` + `@react-three/fiber`.

## 2. Comandos

| Comando             | Uso                                              |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo (`http://localhost:5173`) |
| `npm run build`     | Compilación de producción (en `/dist`)           |
| `npm run preview`   | Sirve la build de producción localmente          |
| `npm run lint`      | ESLint sobre todo el proyecto                    |

> **Importante:** `npm run lint` reporta **~200 errores preexistentes** (variables sin uso, hooks condicionales, etc.) en código antiguo. NO intentes corregirlos todos como parte de otra tarea. La verificación real de que el código nuevo funciona es **`npm run build`** (debe terminar con `✓ built in ...`).

## 3. Stack

- React 19 + Vite (rolldown-vite 7) + Tailwind CSS v4 (plugin `@tailwindcss/vite`).
- Enrutado: `react-router-dom` v7.
- HTTP: Axios (ver `src/services/ApiClient.js`).
- Estado: **Context API** (sin Redux/Zustand).
- 3D: `three`, `@react-three/fiber`, `@react-three/drei`.
- Iconos: `lucide-react`. Excel: `xlsx`. PDF: `jsPDF` + `html2canvas`. Zip: `jszip`. Tours: `driver.js`.

## 4. Mapa de directorios

```
src/
├── main.jsx              # Entry point + providers (BrowserRouter → providers → <App/>)
├── assets/               # Imágenes, .glb, PDFs (se importan vía @assets)
├── components/
│   ├── atoms/            # Componentes primitivos (Modal, Loader, Toast, DataTable...)
│   ├── molecules/        # Combinaciones con lógica (Profile*, *Modal, selectores...)
│   ├── templates/        # Layouts (DashboardTemplate, CoursesTemplate, ReserveSpot)
│   └── RequireAuth.jsx   # Guard de rutas protegidas (valida token)
├── lib/
│   ├── context/          # Auth, Data, School, Student, Teacher, Notification, Audit
│   └── hooks/            # useAuth, useData, useSchool, useStudent, useTeacher, useNotify, useAudit
├── pages/
│   ├── App.jsx           # Componente raíz (initTheme + <GeneralRoutes/>)
│   ├── Login/            # Login, ForgotPassword
│   ├── Dashboard/        # Home, RegisterUser, Reports, Slots, ControlNotas, Auditory
│   ├── Student/          # CRUD de estudiantes (13 vistas)
│   ├── Teacher/          # CRUD de docentes, notas, logros, DBA, asistencia
│   ├── School/           # Instituciones, sedes, grados, asignaturas, boletines
│   ├── GradeRecords/     # Asignación de asignaturas y registros
│   └── Courses/          # Módulo educativo 3D (ver sección 6)
├── routes/generalRoutes.jsx  # Todas las rutas (lazy + Suspense)
├── services/             # ApiClient + *Service por dominio
├── styles/globals.css    # Estilos globales + variables CSS
├── tour/                 # Configuraciones de tours (driver.js), uno por vista
└── utils/                # format, exportPdf, download, validation, theme, css, teacher, bulkDownload, pdfGenerators
```

## 5. Convenciones críticas

- **Alias `@assets`** (definido en `vite.config.js`) → apunta a `src/assets`. Para importar un archivo binario como URL (`.glb`, `.pdf`, `.png`) usar el sufijo `?url`, ej. `import model from "@assets/models/heart.glb?url"`. Para `.png` en componentes React se importa normal: `import img from "@assets/images/heart.png"`.
- **Tailwind inline** en JSX (no hay CSS modules). El color primario es `#1976d2`.
- **Textos en español**, sin emojis, sin comentarios salvo que se pidan explícitamente.
- **Estado global solo vía hooks**: `useAuth()`, `useStudent()`, etc. Nunca `useContext(Context)` directamente.
- **Capa de servicios**: toda llamada HTTP pasa por `ApiClient` (`get/post/put/patch/del`). La respuesta normalizada del backend es `{ code: "OK", result, ... }`; si `code !== "OK"` el interceptor **rechaza la promesa** y emite una notificación global. Soportan `config.silent` (no notificar) y `config.cache` (cache 30s en `get`).
- **Naming**: componentes PascalCase (`.jsx`), hooks `useXxx`, servicios `xxxService.js`, contextos `XxxContext.jsx`.
- Las rutas nuevas de página se registran en `src/routes/generalRoutes.jsx` (lazy import + `<Suspense>`).

## 6. Módulo Courses (educación 3D)

Rutas:
- `/dashboard/courses` → hub de asignaturas (`CoursesHub`).
- `/courses/:courseId` → visor inmersivo (sin sidebar). El `:courseId` se resuelve en `src/pages/Courses/courses.js`.

```js
// courses.js — añadir un curso = 1 entrada aquí
const COURSES = {
  anatomy: lazy(() => import("./anatomy/AnatomyPage")),
  math: lazy(() => import("./math/MathPage")),
  chemistry: lazy(() => import("./chemistry/ChemistryPage")),
};
```

Estructura:
```
src/pages/Courses/
├── courses.js            # Registro de cursos (lazy)
├── CoursesHub.jsx        # Listado de asignaturas (subjects.js)
├── shared/               # CourseViewer, CoursePanel, CourseScene, ContentUnavailable, MoreInfoButton, course.css
├── anatomy/              # 3D: models/, components/{scenes,markers}/, data/anatomyModels.js
│   └── data/subjects.js  # Catálogo de asignaturas del hub (también aquí)
├── math/                 # 7 operaciones, cada una con su Scene/Group/Token
│   ├── addition/ subtraction/ multiplication/ division/
│   ├── power/ squareRoot/ algebraic/
│   └── operations.js, operationInfo.js
├── chemistry/            # Tabla periódica + distribución electrónica (scene={false}, sin canvas 3D)
└── socialSciences/       # Ciencias Sociales: mapa (MapLibre) de países + historia (scene={false})
    ├── SocialSciencesPage.jsx
    ├── components/       # MapScene, HistoryScene, HistoryGroup, HistoryToken
    └── data/             # countries.js, historyData.js
```

Patrón de uso (ver `AnatomyPage.jsx` / `MathPage.jsx` como referencia):
- `<CourseViewer>` es el contenedor principal (panel + canvas + overlays). Props útiles: `title`, `camera`, `controls`, `gizmo`, `ground`, `scene={false}` (para cursos sin 3D como química), `panel`, `overlays`.
- Cada página maneja su propio estado (`selectedModel`, `selectedMarker`, `panelOpen`, etc.) y renderiza su contenido en `children`.

Anatomía (7 modelos en `data/anatomyModels.js`): corazón, corazón interno, cerebro, cerebro corte coronal, pulmones, célula animal, célula vegetal. Cada modelo tiene `{ model, scene }`; las escenas cargan el `.glb` desde URL remota (`model.file`, vía `useGLTF` en `Model.jsx`) y pintan `Marker`s. Los marcadores se agrupan en `components/markers/*Markers.jsx` y muestran info vía `MarkerInfoContent`.

Matemáticas: 7 operaciones en `operations.js` (`addition`, `subtraction`, `multiplication`, `division`, `potencia`, `raiz`, `algebraicas`). `MathPage.jsx` decide qué escena renderizar según `operation`, y `operationInfo.js` guarda título/descripción/wikipedia de cada una.

Assets: modelos `.glb` → se sirven desde URL remota (`models/*.js`); imágenes → `src/assets/images/`, importadas con `@assets`.

## 7. Variables de entorno

| Variable                    | Uso                                            |
| --------------------------- | ---------------------------------------------- |
| `VITE_API_URL`              | URL base de la API REST (usada por ApiClient)  |
| `VITE_API_BACKEND_URL`      | Backend para el proxy `/backend-proxy` (dev)   |
| `VITE_STORAGE_URL`          | Almacenamiento de archivos (proxy `/storage`)  |
| `VITE_CAPTCHA_PUBLIC_KEY`   | Clave pública de reCAPTCHA v3                  |
| `VITE_MAPTILER_KEY`         | Clave de MapTiler (mapas de Ciencias Sociales) |

## 8. Gotchas

- `npm run lint` falla por ~200 errores preexistentes; es ruido, no un bloqueo. Usar `npm run build`.
- Warning de build `IMPORT_IS_UNDEFINED ... getProfile ... authService.js` en `AuthContext.jsx:102` — preexistente, no tocar salvo que se pida.
- `vite.config.js` usa `process.env` y ESLint lo marca `no-undef` — preexistente.
- Regla ESLint `no-unused-vars` permite variables `^[A-Z_]` (mayúsculas/underscore).
- `index.html` tiene `<title>ProjectC</title>` (inconsistente con "Nexus"/"ProjectB").
- `manual.md` referencia una carpeta `./screenshots/` que no existe en el repo.
