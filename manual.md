# MANUAL DE USUARIO

## Nexus — Sistema de Gestión Educativa

Versión: 1.0  
Fecha: 24/04/2026

---

## HOJA DE CONTROL

- Programa: Nexus — Sistema de Gestión Educativa
- Proyecto: ProjectB
- Entregable: Manual de Usuario
- Autor: Equipo de Desarrollo ProjectB
- Versión: 1.0
- Fecha: 24/04/2026
- Aprobado por: —
- Nº Total de Páginas: —

---

## REGISTRO DE CAMBIOS

| Versión | Causa del Cambio | Responsable          | Fecha      |
| ------- | ---------------- | -------------------- | ---------- |
| 1.0     | Versión inicial  | Equipo de Desarrollo | 24/04/2026 |

---

## CONTROL DE DISTRIBUCIÓN

- Equipo de Desarrollo
- Usuarios institucionales del sistema Nexus

---

# 1. DESCRIPCIÓN DEL SISTEMA

## 1.1 Objeto

Nexus es una plataforma web de gestión educativa integral orientada a instituciones de educación básica y media. Su objetivo es centralizar y digitalizar todos los procesos administrativos y académicos de un centro educativo: desde el registro de estudiantes y docentes hasta la generación de boletines de calificaciones, control de asistencia y seguimiento disciplinario, eliminando el uso de registros físicos o sistemas fragmentados.

## 1.2 Alcance

El sistema cubre los siguientes procesos institucionales:

- **Gestión de instituciones y sedes:** Registro, configuración y personalización visual (logo, colores) de múltiples instituciones con soporte multi-sede.
- **Gestión de estudiantes:** Registro individual y masivo (Excel), matrícula, perfil académico completo, acudientes, carné estudiantil.
- **Gestión de docentes:** Registro, asignación de asignaturas, sedes y grados a cargo, historial de asistencia.
- **Calificaciones y logros:** Registro de notas por asignatura, período y estudiante; gestión de logros académicos y Derechos Básicos de Aprendizaje (DBA).
- **Control de asistencia:** Registro y seguimiento de asistencia de estudiantes y docentes por sesión.
- **Observador del estudiante:** Documentación de incidentes conductuales y seguimiento disciplinario.
- **Boletines académicos:** Generación y descarga en PDF de informes de calificaciones por período.
- **Reportes institucionales:** Exportación de informes en PDF y Excel.
- **Auditoría:** Trazabilidad de todas las acciones realizadas en el sistema.
- **Reserva de cupos:** Formulario público para acudientes interesados en inscribir estudiantes.
- **Notificaciones en tiempo real:** Sistema de alertas de éxito, error, advertencia e información.
- **Tours guiados:** Onboarding interactivo para cada funcionalidad.

El sistema **no** gestiona procesos de nómina, contabilidad ni comunicación externa (correo o mensajería).

## 1.3 Funcionalidad

Las funciones principales del sistema son:

| N°  | Funcionalidad                        | Descripción resumida                                                    |
| --- | ------------------------------------ | ----------------------------------------------------------------------- |
| 1   | Autenticación y control de acceso    | Inicio de sesión seguro con menú dinámico según rol del usuario         |
| 2   | Registro de estudiantes              | Alta individual y masiva, con foto, datos personales y académicos       |
| 3   | Registro de acudientes               | Vinculación de responsables legales con firma digital                   |
| 4   | Perfil completo del estudiante       | Vista unificada con historial académico, asistencia, notas y observador |
| 5   | Registro y gestión de docentes       | Alta, edición, asignación de carga académica                            |
| 6   | Gestión de asignaturas y grados      | Configuración del currículo institucional                               |
| 7   | Calificaciones                       | Ingreso y edición de notas por asignatura, período y grupo              |
| 8   | Logros y DBA                         | Definición y gestión de objetivos evaluativos                           |
| 9   | Control de asistencia                | Marcado, edición y reporte de asistencia                                |
| 10  | Observador del estudiante            | Registro y seguimiento disciplinario/conductual                         |
| 11  | Boletines académicos                 | Generación y descarga de boletines en PDF (individual y masivo)         |
| 12  | Reportes                             | Exportación de informes institucionales                                 |
| 13  | Gestión de instituciones y sedes     | Creación, edición y personalización de entidades institucionales        |
| 14  | Auditoría del sistema                | Consulta del historial de acciones por usuario, fecha y tipo            |
| 15  | Reserva pública de cupos             | Formulario accesible sin autenticación para prospección de estudiantes  |
| 16  | Gestión de cupos                     | Visualización y análisis de cupos reservados con filtros y gráficas     |
| 17  | Personalización visual institucional | Colores y logo aplicados globalmente por institución                    |

---

# 2. MAPA DEL SISTEMA

## 2.1 Modelo Lógico

El sistema sigue un flujo principal basado en el rol del usuario autenticado:

```
1. Acceso
   └─ El usuario ingresa a la URL del sistema en su navegador web.

2. Autenticación
   ├─ El usuario introduce su correo electrónico y contraseña.
   ├─ El sistema valida las credenciales contra el servidor.
   └─ Si son correctas, carga el menú y el tema institucional correspondiente al rol.

3. Panel principal (Dashboard)
   └─ Vista de inicio con métricas, alertas y acceso a todos los módulos.

4. Navegación por módulos (según rol)
   ├─ Módulo Estudiantes
   │   ├─ Listar, buscar y ver perfil de estudiantes
   │   ├─ Registrar nuevo estudiante (individual o masivo)
   │   ├─ Registrar acudientes y vincular con firma
   │   ├─ Gestionar notas, asistencia y observador
   │   └─ Generar carné estudiantil
   │
   ├─ Módulo Docentes
   │   ├─ Registrar, editar y ver perfil de docentes
   │   ├─ Registrar y gestionar asistencia
   │   ├─ Ingresar calificaciones y logros
   │   └─ Gestionar DBA por asignatura
   │
   ├─ Módulo Gestión Escolar
   │   ├─ Administrar instituciones y sedes
   │   ├─ Configurar grados y asignaturas
   │   ├─ Generar boletines académicos
   │   └─ Registrar hoja de vida académica del estudiante
   │
   ├─ Módulo Registros Académicos
   │   ├─ Asignar asignaturas a docentes y grupos
   │   └─ Consolidar calificaciones en el historial
   │
   └─ Módulo Dashboard / Administración
       ├─ Reportes institucionales
       ├─ Registro de nuevos usuarios del sistema
       └─ Auditoría de acciones

5. Cierre de sesión
   └─ El usuario cierra sesión desde el menú. El token se elimina y se redirige al login.
```

### Acceso público (sin autenticación)

```
/reserveSpot  →  Formulario de reserva de cupos para acudientes externos
```

## 2.2 Navegación

La navegación del sistema se organiza en torno a un **panel lateral (sidebar)** que aparece tras iniciar sesión. Las opciones disponibles en el menú varían según el rol del usuario.

### Estructura de rutas

| Ruta                                | Vista                      | Acceso requerido            |
| ----------------------------------- | -------------------------- | --------------------------- |
| `/login`                            | Inicio de sesión           | Público                     |
| `/forgot-password`                  | Recuperación de contraseña | Público                     |
| `/reserveSpot`                      | Reserva de cupos           | Público                     |
| `/dashboard/home`                   | Panel principal            | Autenticado                 |
| `/dashboard/registerUser`           | Registrar usuario          | Administrador / Director    |
| `/dashboard/studentSchool`          | Listado de estudiantes     | Todos los roles             |
| `/dashboard/registerStudent`        | Registrar estudiante       | Admin / Director / Coord.   |
| `/dashboard/registerParents`        | Registrar acudiente        | Admin / Director / Coord.   |
| `/dashboard/manageStudent`          | Gestión de estudiantes     | Admin / Director            |
| `/dashboard/profileStudent`         | Perfil del estudiante      | Todos los roles             |
| `/dashboard/searchStudents`         | Búsqueda de estudiantes    | Todos los roles             |
| `/dashboard/uploadStudentExcel`     | Carga masiva Excel         | Admin / Director            |
| `/dashboard/studentNotes`           | Notas del estudiante       | Docente / Coord. / Director |
| `/dashboard/assistenceStudent`      | Asistencia del estudiante  | Docente / Coordinador       |
| `/dashboard/observadorEstudiante`   | Observador disciplinario   | Docente / Coord. / Director |
| `/dashboard/manageObserver`         | Gestión del observador     | Admin / Director / Coord.   |
| `/dashboard/registerTeacher`        | Registrar docente          | Admin / Director            |
| `/dashboard/manageTeacher`          | Gestión de docentes        | Admin / Director            |
| `/dashboard/profileTeacher`         | Perfil del docente         | Admin / Director / Docente  |
| `/dashboard/registerAssistance`     | Registrar asistencia       | Docente / Coordinador       |
| `/dashboard/manageAssistance`       | Gestión de asistencia      | Coordinador / Admin         |
| `/dashboard/controlAsistencia`      | Control de asistencia      | Director / Coord. / Admin   |
| `/dashboard/manageLogro`            | Gestión de logros          | Docente / Coord. / Admin    |
| `/dashboard/manageNote`             | Ingresar calificaciones    | Docente                     |
| `/dashboard/manageDBA`              | Gestión de DBA             | Docente / Coord. / Admin    |
| `/dashboard/manageSchools`          | Gestión de instituciones   | Administrador               |
| `/dashboard/profileSchool`          | Perfil de institución      | Admin / Director            |
| `/dashboard/manageSedes`            | Gestión de sedes           | Admin / Director            |
| `/dashboard/manageAsignature`       | Gestión de asignaturas     | Admin / Director / Coord.   |
| `/dashboard/manageGrade`            | Gestión de grados          | Admin / Director            |
| `/dashboard/registerGrade`          | Registrar grado            | Admin / Director            |
| `/dashboard/manageBoletin`          | Boletines académicos       | Admin / Director / Coord.   |
| `/dashboard/registerStudentRecords` | Hoja de vida académica     | Admin / Coordinador         |
| `/dashboard/registerAsignature`     | Asignar asignaturas        | Admin / Director / Coord.   |
| `/dashboard/registerRecords`        | Registrar calificaciones   | Docente / Coordinador       |
| `/dashboard/reports`                | Reportes                   | Admin / Director / Coord.   |
| `/dashboard/auditory`               | Auditoría                  | Admin / Director            |
| `/dashboard/slots`                  | Cupos                      | Admin / Director            |

### Roles y nivel de acceso

| Rol                  | Descripción                                                    | Nivel      |
| -------------------- | -------------------------------------------------------------- | ---------- |
| Administrador        | Acceso total al sistema incluyendo configuración institucional | Total      |
| Director             | Gestión institucional, reportes y supervisión académica        | Alto       |
| Coordinador / Rector | Gestión académica, asignación docente, boletines y observador  | Medio-Alto |
| Docente              | Calificaciones, asistencia, logros, DBA y notas del estudiante | Medio      |
| Acudiente / Padre    | Consulta de perfil y seguimiento del estudiante a su cargo     | Lectura    |

---

# 3. DESCRIPCIÓN DEL SISTEMA

## 3.1 Módulo de Autenticación

### Iniciar sesión

1. Abrir el navegador e ingresar a la URL del sistema.
2. En la pantalla de **Login**, escribir el correo electrónico institucional y la contraseña asignada.
3. Hacer clic en **Ingresar**.
4. Si las credenciales son correctas, el sistema redirige automáticamente al **Panel Principal**.

> La contraseña se procesa de forma segura en el navegador antes de enviarse al servidor. Nunca se transmite en texto plano.

### Recuperar contraseña

1. En la pantalla de **Login**, hacer clic en **¿Olvidó su contraseña?**.
2. Ingresar el correo electrónico registrado y enviar la solicitud.
3. Revisar el correo recibido con el enlace de recuperación.
4. Seguir el enlace, ingresar la nueva contraseña y confirmarla.

---

## 3.2 Módulo de Estudiantes

### Registrar un nuevo estudiante

1. En el menú lateral, ir a **Estudiantes → Registrar Estudiante**.
2. Completar los datos personales: nombres, apellidos, tipo y número de identificación, fecha de nacimiento, dirección, ciudad y departamento.
3. Seleccionar la **sede**, el **grado** y la **jornada** académica.
4. (Opcional) Capturar la fotografía del estudiante usando el botón de cámara.
5. (Opcional) Registrar información de beca si aplica.
6. Hacer clic en **Guardar**. El sistema mostrará una notificación de éxito.
7. Continuar al registro de acudiente si se solicita.

### Registrar acudiente / responsable legal

1. Tras registrar al estudiante, el sistema puede redirigir a **Registrar Acudiente**, o acceder desde **Estudiantes → Registrar Acudiente**.
2. Completar los datos del responsable legal (nombre, identificación, teléfono, parentesco).
3. Leer y aceptar los términos y condiciones.
4. Firmar digitalmente en el área de firma habilitada.
5. Hacer clic en **Guardar**.

### Carga masiva de estudiantes (Excel)

1. Ir a **Estudiantes → Cargar Excel**.
2. Descargar la plantilla de ejemplo haciendo clic en **Descargar plantilla**.
3. Completar la plantilla con los datos de los estudiantes a registrar.
4. Subir el archivo haciendo clic en **Seleccionar archivo** y elegir el Excel completado.
5. El sistema procesará el archivo y mostrará el resultado de la importación (registros exitosos y con error).

### Buscar un estudiante

1. Ir a **Estudiantes → Buscar Estudiantes** o usar el listado general en **Estudiantes → Todos los Estudiantes**.
2. Usar los filtros disponibles (nombre, número de identificación, sede, grado, jornada).
3. Hacer clic en el nombre del estudiante para ver su perfil completo.

### Ver perfil del estudiante

El perfil del estudiante centraliza toda su información en una sola vista:

- **Datos personales y familiares**
- **Historial de calificaciones** por asignatura y período
- **Registro de asistencia**
- **Observador disciplinario**
- **Documentos:** Descarga de documentos y generación de carné estudiantil en PDF

### Gestionar (editar / eliminar) estudiante

1. Ir a **Estudiantes → Gestionar Estudiantes**.
2. Buscar al estudiante por nombre o identificación.
3. Hacer clic en el botón de **editar** para modificar sus datos o en **eliminar** para borrar el registro (acción irreversible, requiere confirmación).

---

## 3.3 Módulo de Docentes

### Registrar un nuevo docente

1. Ir a **Docentes → Registrar Docente**.
2. Completar los datos personales del docente.
3. Seleccionar la sede y el grado a cargo.
4. Indicar si el docente es **director de grupo**.
5. Hacer clic en **Guardar**.

### Ver perfil del docente

El perfil del docente incluye:

- Datos personales
- Asignaturas asignadas
- Historial de asistencia
- Notas y logros registrados

### Ingresar calificaciones

1. Ir a **Docentes → Calificaciones** (o **Gestionar Notas**).
2. Seleccionar la **asignatura**, el **período** académico y el **grupo**.
3. El sistema cargará la tabla de estudiantes del grupo.
4. Ingresar la calificación correspondiente a cada estudiante.
5. Hacer clic en **Guardar**. El sistema notificará el resultado por cada registro.

### Registrar asistencia

1. Ir a **Docentes → Registrar Asistencia**.
2. Seleccionar la fecha, asignatura y grupo.
3. Marcar la asistencia de cada estudiante (Presente / Ausente / Tardanza).
4. Guardar el registro.

### Gestionar logros y DBA

- **Logros:** Ir a **Docentes → Gestionar Logros**. Crear y editar los objetivos evaluativos por asignatura y período.
- **DBA:** Ir a **Docentes → Gestionar DBA**. Administrar los Derechos Básicos de Aprendizaje asociados a cada asignatura y nivel.

---

## 3.4 Módulo de Gestión Escolar

### Gestionar institución

1. Ir a **Escuela → Gestionar Instituciones** (solo Administrador).
2. Crear una nueva institución o editar una existente.
3. Configurar nombre, logo y colores institucionales (primario y secundario). Los colores se aplican automáticamente en toda la interfaz.
4. Gestionar las **escalas de calificación** (por ejemplo: escala numérica 1.0–5.0, cualitativa, etc.).

### Gestionar sedes

1. Ir a **Escuela → Gestionar Sedes**.
2. Crear nueva sede con nombre y dirección, o editar una existente.
3. Cada sede opera de manera independiente con sus propios grados, jornadas y docentes.

### Gestionar grados y asignaturas

- **Grados:** Ir a **Escuela → Gestionar Grados** para configurar los niveles académicos (Preescolar, Primero, Segundo… Once, etc.).
- **Asignaturas:** Ir a **Escuela → Gestionar Asignaturas** para administrar las materias por sede y grado.

### Generar boletines académicos

1. Ir a **Escuela → Boletines**.
2. Seleccionar el **período**, la **sede** y el **grado**.
3. El sistema consolidará notas, logros y asistencia del período seleccionado.
4. Visualizar la vista previa del boletín.
5. Descargar el boletín:
   - **Individual:** un PDF por estudiante.
   - **Masivo:** todos los boletines del grado en un solo lote.

> Los boletines incluyen el logo y los colores institucionales configurados.

---

## 3.5 Módulo de Registros Académicos

### Asignar asignaturas a docentes

1. Ir a **Registros → Asignar Asignatura**.
2. Seleccionar el docente, la asignatura, el grado y el período.
3. Confirmar la asignación. Esto habilita al docente para ingresar notas en dicha asignatura.

### Registrar calificaciones en el historial

1. Ir a **Registros → Registrar Calificaciones**.
2. Seleccionar el estudiante, asignatura y período.
3. Ingresar las calificaciones y confirmar.

---

## 3.6 Módulo de Observador del Estudiante

1. Ir a **Estudiantes → Observador** o acceder desde el perfil del estudiante.
2. Seleccionar el estudiante correspondiente.
3. Crear un nuevo registro indicando: tipo de novedad (disciplinaria, académica, conductual), descripción y fecha.
4. El registro queda almacenado en el historial del estudiante.
5. Para administrar (editar/eliminar) registros existentes ir a **Estudiantes → Gestionar Observador**.

---

## 3.7 Módulo de Reportes

1. Ir a **Dashboard → Reportes**.
2. Seleccionar el tipo de reporte deseado (asistencia, calificaciones, estadísticas, etc.).
3. Configurar los parámetros: período, sede, grado.
4. Hacer clic en **Generar**.
5. Descargar el archivo en **PDF** o **Excel** según la opción disponible.

---

## 3.8 Módulo de Auditoría

1. Ir a **Dashboard → Auditoría** (solo Administrador y Director).
2. Consultar el historial de acciones del sistema filtrado por fecha, usuario o tipo de acción.
3. Hacer clic en un registro para ver su detalle completo.

> La auditoría es de solo lectura. No es posible editar ni eliminar registros de auditoría.

---

## 3.9 Reserva de Cupos (Acceso Público)

Esta funcionalidad está disponible **sin necesidad de iniciar sesión**.

1. Ingresar a la URL del sistema y navegar a `/reserveSpot` (o usar el enlace compartido por la institución).
2. Completar el formulario con los datos del estudiante prospecto y del acudiente.
3. Leer y aceptar los términos y condiciones.
4. Firmar digitalmente en el campo habilitado.
5. Enviar el formulario. El sistema registrará la solicitud de cupo y mostrará una confirmación.

---

## 3.10 Funcionalidades Transversales

### Tours guiados

Al ingresar por primera vez a una funcionalidad, el sistema puede iniciar un **tour guiado interactivo** que destaca paso a paso los elementos de la pantalla y explica su uso. Para activar un tour manualmente, buscar el botón de **ayuda** o **tour** dentro de cada módulo.

### Notificaciones del sistema

Las notificaciones aparecen en la esquina de la pantalla e informan sobre:

- **Verde (Éxito):** Operación completada correctamente.
- **Rojo (Error):** La operación falló. Revisar los datos ingresados.
- **Amarillo (Advertencia):** La operación completó con observaciones.
- **Azul (Información):** Mensajes informativos del sistema.

Las notificaciones desaparecen automáticamente.

### Cambio de contraseña

El usuario puede cambiar su contraseña desde el menú de perfil de usuario. Se requiere ingresar la contraseña actual y la nueva contraseña (mínimo 8 caracteres).

---

# 4. INSTALACIÓN

## 4.1 Requisitos

### Requisitos del servidor / entorno de despliegue

| Software | Versión mínima | Notas                               |
| -------- | -------------- | ----------------------------------- |
| Node.js  | 18.x LTS       | Se recomienda la última versión LTS |
| npm      | 9.x            | Incluido con Node.js                |
| Git      | 2.x            | Para clonar el repositorio          |

### Requisitos del usuario final (navegador)

| Navegador       | Versión mínima | Notas       |
| --------------- | -------------- | ----------- |
| Google Chrome   | 110+           | Recomendado |
| Mozilla Firefox | 110+           | Compatible  |
| Microsoft Edge  | 110+           | Compatible  |

> El sistema **no es compatible** con Internet Explorer.  
> Para las funcionalidades de **captura de fotografía** y **firma digital**, el dispositivo debe contar con cámara y/o pantalla táctil o puntero compatible.

### Acceso al backend

Se requiere acceso a la API REST del backend. La URL por defecto es:  
`https://backend-barranquilla.onrender.com`

---

## 4.2 Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd ProjectB
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar en entorno de desarrollo

```bash
npm run dev
```

El sistema estará disponible en `http://localhost:5173`.

### 4. Compilar para producción

```bash
npm run build
```

Los archivos listos para producción se generan en la carpeta `/dist`.

### 5. Vista previa de la compilación de producción (local)

```bash
npm run preview
```

---

## 4.3 Configuración

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# URL base de la API REST del backend
VITE_API_URL=https://backend-barranquilla.onrender.com
```

> Si `VITE_API_URL` no se define, el sistema usará la URL de producción por defecto.  
> Todas las variables deben incluir el prefijo `VITE_` (convención de Vite).

### Despliegue en Vercel

El proyecto está configurado para despliegue automático en Vercel. El archivo `vercel.json` en la raíz del proyecto gestiona la reescritura de rutas para el funcionamiento de la SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Pasos para desplegar en Vercel:

1. Conectar el repositorio Git al proyecto en [vercel.com](https://vercel.com).
2. Configurar la variable de entorno `VITE_API_URL` en el dashboard de Vercel.
3. Vercel detecta automáticamente el comando de build (`npm run build`) y la carpeta de salida (`dist`).
4. Cada `push` o `merge` a la rama principal activa un nuevo despliegue automático.

---

# 5. VISTAS Y FUNCIONALIDADES DEL SISTEMA

Este capítulo describe en detalle cada pantalla del sistema, su propósito, las acciones disponibles para el usuario y los roles con acceso. Está orientado tanto a la presentación del proyecto como a la capacitación de usuarios finales.

---

## 5.1 Flujo General de Navegación

```
┌─────────────────────────────────────────────────────────┐
│                   ACCESO AL SISTEMA                     │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │  ¿Usuario           │
          │  autenticado?       │
          └──────┬──────┬───────┘
               No│      │Sí
                 │      │
    ┌────────────▼─┐  ┌─▼──────────────────┐
    │  /login       │  │  /dashboard/home   │
    │  (Login)      │  │  (Panel Principal) │
    └──────┬────────┘  └────────┬───────────┘
           │                    │
    ┌──────▼────────┐           │ Navegación por sidebar
    │ Credenciales  │    ┌──────▼────────────────────────┐
    │ válidas?      │    │  Módulos disponibles por rol  │
    └──────┬────────┘    │  • Estudiantes                │
           │             │  • Docentes                   │
    ┌──────▼────────┐    │  • Gestión Escolar            │
    │ Carga menú,   │    │  • Registros Académicos       │
    │ tema y redirige│   │  • Reportes / Auditoría       │
    └───────────────┘    └───────────────────────────────┘

Acceso público (sin autenticación):
    /reserveSpot  →  Reserva de cupos para acudientes externos
```

---

## 5.2 Dominio: Autenticación

### Vista — Login (`/login`)

**Propósito:** Punto de entrada al sistema. Permite a los usuarios institucionales autenticarse para acceder al panel.

**Captura de pantalla:**

![Vista — Login](./screenshots/login.png)

**Elementos de la pantalla:**

| Elemento            | Descripción                                  |
| ------------------- | -------------------------------------------- |
| Campo Email         | Correo electrónico institucional del usuario |
| Campo Contraseña    | Contraseña de la cuenta (enmascarada)        |
| Botón Ingresar      | Envía las credenciales al servidor           |
| Enlace Olvidé clave | Redirige a la recuperación de contraseña     |

**Acciones del usuario:**

1. Ingresar email y contraseña.
2. Hacer clic en **Ingresar**.
3. Si las credenciales son correctas: se carga el menú dinámico según el rol, se aplica el tema institucional (colores y logo) y se redirige a `/dashboard/home`.
4. Si son incorrectas: aparece una notificación de error en pantalla.

**Seguridad:** La contraseña es hasheada con SHA-256 en el navegador antes de enviarse. Nunca viaja en texto plano.

**Roles:** Acceso público (no requiere sesión).

---

### Vista — Recuperar Contraseña (`/forgot-password`)

**Propósito:** Permite restablecer la contraseña en caso de olvido.

**Captura de pantalla:**

![Vista — Recuperar Contraseña](./screenshots/forgotPassword.png)

**Flujo:**

1. El usuario ingresa su correo electrónico registrado.
2. El sistema envía un enlace de recuperación al correo.
3. El usuario sigue el enlace, ingresa su nueva contraseña y confirma.
4. El sistema actualiza la contraseña y redirige al login.

**Roles:** Acceso público (no requiere sesión).

---

## 5.3 Dominio: Público

### Vista — Reserva de Cupos (`/reserveSpot`)

**Propósito:** Formulario externo para acudientes interesados en matricular a un estudiante. No requiere cuenta en el sistema.

**Captura de pantalla:**

![Vista — Reserva de Cupos](./screenshots/reserveSpot.png)

**Elementos de la pantalla:**

| Elemento                  | Descripción                                                   |
| ------------------------- | ------------------------------------------------------------- |
| Formulario del estudiante | Datos personales del prospecto (nombre, identificación, etc.) |
| Formulario del acudiente  | Datos del responsable legal                                   |
| Modal de términos         | Texto de términos y condiciones de matrícula                  |
| Panel de firma digital    | Canvas para captura de firma del acudiente                    |
| Botón Enviar solicitud    | Envía el formulario al servidor                               |

**Acciones del usuario:**

1. Completar el formulario con los datos del estudiante y del acudiente.
2. Leer y aceptar los términos y condiciones.
3. Dibujar la firma digital en el área habilitada.
4. Enviar la solicitud. El sistema confirma el registro del cupo.

**Roles:** Acceso público (no requiere sesión).

---

## 5.4 Dominio: Dashboard / Administración

### Vista — Panel Principal (`/dashboard/home`)

**Propósito:** Vista de inicio tras autenticación. Muestra el estado general de la institución con métricas clave y acceso rápido a módulos.

**Captura de pantalla:**

![Vista — Panel Principal](./screenshots/home.png)

**Elementos de la pantalla:**

| Elemento              | Descripción                                                      |
| --------------------- | ---------------------------------------------------------------- |
| Tarjetas de métricas  | Total de estudiantes, docentes y alertas activas                 |
| Gráficas estadísticas | Distribución por grado, jornada, asistencia (Recharts)           |
| Tabla de alertas      | Alertas institucionales recientes con estado y tipo              |
| Panel de perfil       | Información del usuario autenticado (nombre, rol, sede asignada) |

**Acciones del usuario:**

- Consultar indicadores institucionales de un vistazo.
- Ver alertas recientes y acceder a su detalle.
- Navegar a cualquier módulo desde el sidebar.

**Roles:** Administrador, Director, Coordinador, Docente.

---

### Vista — Registrar Usuario (`/dashboard/registerUser`)

**Propósito:** Crear cuentas de acceso al sistema para nuevos miembros del personal institucional.

**Captura de pantalla:**

![Vista — Registrar Usuario](./screenshots/registerUser.png)

**Elementos del formulario:**

| Campo                 | Descripción                                               |
| --------------------- | --------------------------------------------------------- |
| Nombre completo       | Nombres y apellidos del usuario                           |
| Correo                | Email institucional (será el usuario de acceso)           |
| Contraseña            | Contraseña inicial de la cuenta                           |
| Rol                   | Selección del rol asignado (Administrador, Docente, etc.) |
| Institución           | Institución a la que pertenece el usuario                 |
| Sede                  | Sede específica asignada                                  |
| Departamento / Ciudad | Datos geográficos del usuario                             |

**Roles:** Administrador, Director.

---

### Vista — Auditoría (`/dashboard/auditory`)

**Propósito:** Registro histórico de todas las operaciones realizadas en el sistema para trazabilidad y control.

**Captura de pantalla:**

![Vista — Auditoría](./screenshots/auditory.png)

**Elementos de la pantalla:**

| Elemento           | Descripción                                                  |
| ------------------ | ------------------------------------------------------------ |
| Tabla de auditoría | Listado paginado de acciones con usuario, tipo, fecha y hora |
| Filtros            | Búsqueda por fecha, usuario y tipo de acción                 |
| Modal de detalle   | Vista expandida de un registro específico                    |

> La auditoría es **solo lectura**. No se pueden editar ni eliminar registros.

**Roles:** Administrador, Director.

---

### Vista — Reportes (`/dashboard/reports`)

**Propósito:** Generación centralizada de informes institucionales en múltiples formatos.

**Captura de pantalla:**

![Vista — Reportes](./screenshots/reports.png)

**Acciones disponibles:**

- Seleccionar el tipo de reporte (asistencia, calificaciones, estadísticas generales).
- Definir parámetros: período académico, sede y grado.
- Exportar el informe en **PDF** o **Excel** (.xlsx).

**Roles:** Administrador, Director, Coordinador.

---

### Vista — Cupos (`/dashboard/slots`)

**Propósito:** Visualización y análisis de los cupos reservados en la institución. Permite consultar la distribución de cupos por año académico mediante gráficas interactivas y una tabla de detalle, con filtros adicionales para segmentar la información por sede, jornada, grado y origen del estudiante.

**Captura de pantalla:**

![Vista — Cupos](./screenshots/slots.png)

**Elementos de la pantalla:**

| Elemento                  | Descripción                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Selector Año              | Desplegable para elegir el año académico a consultar (2025–2030)                    |
| Botón Consultar           | Ejecuta la búsqueda de cupos para el año seleccionado                               |
| Filtro Sede               | Aparece tras cargar datos; filtra por nombre de sede                                |
| Filtro Jornada            | Aparece tras cargar datos; filtra por jornada académica                             |
| Filtro Grado              | Aparece tras cargar datos; filtra por grado                                         |
| Filtro De donde viene     | Aparece tras cargar datos; filtra por tipo / origen del estudiante                  |
| Gráfica Cupos por Sede    | Gráfico de barras con el total de cupos agrupados por sede                          |
| Gráfica Cupos por Jornada | Gráfico de barras con el total de cupos agrupados por jornada                       |
| Gráfica Cupos por Grado   | Gráfico de barras con el total de cupos agrupados por grado                         |
| Gráfica Cupos por Tipo    | Gráfico de barras con el total de cupos agrupados por tipo de origen                |
| Tabla Detalle de cupos    | Listado completo de registros con ID, sede, jornada, grado, tipo y fecha de reserva |

**Flujo de uso:**

1. Seleccionar el **año** académico en el desplegable.
2. Hacer clic en **Consultar**. El sistema cargará todos los cupos registrados para ese año.
3. Una vez cargados los datos, aparecerán los filtros secundarios (**Sede**, **Jornada**, **Grado**, **De donde viene**).
4. Aplicar uno o varios filtros para segmentar la información. Las gráficas y la tabla se actualizarán en tiempo real.
5. Consultar las gráficas de barras para obtener una visión agregada por categoría.
6. Revisar la tabla de **Detalle de cupos** para ver cada registro individual. Desde la tabla es posible exportar los datos.

> Los filtros secundarios se reinician automáticamente cada vez que se hace una nueva consulta por año.

**Columnas de la tabla de detalle:**

| Columna          | Descripción                                   |
| ---------------- | --------------------------------------------- |
| ID               | Identificador interno del cupo reservado      |
| Sede             | Nombre de la sede a la que pertenece el cupo  |
| Jornada          | Jornada académica asignada                    |
| Grado            | Grado al que corresponde el cupo              |
| Tipo             | Origen o tipo del estudiante prospecto        |
| Fecha de reserva | Fecha en que se registró la solicitud de cupo |

**Roles:** Administrador, Director.

---

## 5.5 Dominio: Estudiantes

### Vista — Listado de Estudiantes (`/dashboard/studentSchool`)

**Propósito:** Consulta general de todos los estudiantes matriculados en la institución.

**Captura de pantalla:**

![Vista — Listado de Estudiantes](./screenshots/studentSchool.png)

**Elementos de la pantalla:**

| Elemento          | Descripción                                                    |
| ----------------- | -------------------------------------------------------------- |
| Tabla paginada    | Listado de estudiantes con nombre, identificación, grado, sede |
| Barra de búsqueda | Búsqueda instantánea por nombre o identificación               |
| Filtros           | Filtrado por sede, grado y jornada académica                   |
| Botón ver perfil  | Accede al perfil completo del estudiante seleccionado          |

**Roles:** Todos los roles autenticados.

---

### Vista — Registrar Estudiante (`/dashboard/registerStudent`)

**Propósito:** Dar de alta a un nuevo estudiante en el sistema con toda su información personal y académica.

**Captura de pantalla:**

![Vista — Registrar Estudiante](./screenshots/registerStudent.png)

**Secciones del formulario:**

| Sección           | Campos incluidos                                                          |
| ----------------- | ------------------------------------------------------------------------- |
| Datos personales  | Nombres, apellidos, tipo de ID, número de ID, fecha de nacimiento, género |
| Datos de contacto | Dirección, departamento, ciudad, teléfono                                 |
| Datos académicos  | Sede, grado, jornada, estado de beca                                      |
| Fotografía        | Captura directa desde cámara del dispositivo (CameraModal)                |

**Validaciones clave:**

- Todos los campos obligatorios deben estar completos antes de guardar.
- El número de identificación debe ser único en el sistema.
- El email debe tener formato válido si se proporciona.

**Roles:** Administrador, Director, Coordinador.

---

### Vista — Registrar Acudiente (`/dashboard/registerParents`)

**Propósito:** Vincular un responsable legal al estudiante previamente registrado.

**Captura de pantalla:**

![Vista — Registrar Acudiente](./screenshots/registerParents.png)

**Elementos del formulario:**

| Campo               | Descripción                                |
| ------------------- | ------------------------------------------ |
| Datos del acudiente | Nombre, tipo de ID, número de ID, teléfono |
| Parentesco          | Relación con el estudiante                 |
| Términos y firma    | Aceptación y firma digital del acudiente   |

**Roles:** Administrador, Director, Coordinador.

---

### Vista — Carga Masiva Excel (`/dashboard/uploadStudentExcel`)

**Propósito:** Importar múltiples estudiantes simultáneamente desde un archivo Excel.

**Captura de pantalla:**

![Vista — Carga Masiva Excel](./screenshots/uploadStudentExcel.png)

**Flujo de uso:**

1. Descargar la **plantilla oficial** desde el botón habilitado.
2. Completar la plantilla con los datos de los estudiantes.
3. Subir el archivo Excel al sistema.
4. El sistema procesa cada fila y reporta:
   - Registros creados exitosamente.
   - Filas con error (con descripción del problema por fila).

**Roles:** Administrador, Director.

---

### Vista — Perfil del Estudiante (`/dashboard/profileStudent`)

**Propósito:** Vista unificada con toda la información del estudiante en un solo lugar.

**Captura de pantalla:**

![Vista — Perfil del Estudiante](./screenshots/profileStudent.png)

**Secciones del perfil:**

| Sección             | Contenido                                                     |
| ------------------- | ------------------------------------------------------------- |
| Datos personales    | Información de identificación, contacto y foto                |
| Datos familiares    | Acudiente registrado con datos de contacto                    |
| Historial académico | Calificaciones por asignatura y período académico             |
| Asistencia          | Registro histórico de presencia por sesión                    |
| Observador          | Anotaciones disciplinarias y conductuales                     |
| Documentos          | Descarga de documentos académicos, generación de carné en PDF |

**Roles:** Todos los roles autenticados (el Acudiente solo puede ver el perfil del estudiante a su cargo).

---

### Vista — Gestión de Estudiantes (`/dashboard/manageStudent`)

**Propósito:** Panel de administración CRUD completo para estudiantes. Permite registrar, actualizar y gestionar la información de todos los estudiantes de la institución, con soporte para importación masiva.

**Captura de pantalla:**

![Vista — Gestión de Estudiantes](./screenshots/manageStudent.png)

**Elementos de la pantalla:**

| Elemento             | Descripción                                                    |
| -------------------- | -------------------------------------------------------------- |
| Tabla de estudiantes | Identificación, nombre completo, sede, grado, grupo y jornada  |
| Botón Registrar      | Abre el modal de registro de nuevo estudiante                  |
| Botón Carga masiva   | Abre el modal de importación desde Excel                       |
| Botón Subir PDF(s)   | Abre el modal de importación desde PDFs                        |
| Botón Ver perfil     | Accede al perfil completo del estudiante seleccionado          |
| Botón Actualizar     | Abre el modal de edición con los datos actuales del estudiante |

**Modales utilizados:**

| Modal                | Propósito                                                                  |
| -------------------- | -------------------------------------------------------------------------- |
| `RegisterStudent`    | Formulario de registro de nuevo estudiante (datos personales y académicos) |
| `UploadStudentExcel` | Importar múltiples estudiantes desde un archivo Excel                      |
| `UploadStudentPDF`   | Importar datos de estudiantes desde archivos PDF                           |
| `StudentModal`       | Ver y editar datos completos del estudiante seleccionado                   |

**Captura de pantalla:**

![Vista — Gestión de Estudiantes](./screenshots/manageStudent.png)

**Roles:** Administrador, Director.

---

### Vista — Búsqueda de Estudiantes (`/dashboard/searchStudents`)

**Propósito:** Localización avanzada de estudiantes con múltiples criterios simultáneos.

**Captura de pantalla:**

![Vista — Búsqueda de Estudiantes](./screenshots/searchStudents.png)

**Criterios de búsqueda disponibles:** Nombre, apellido, número de identificación, sede, grado y jornada.

**Roles:** Todos los roles autenticados.

---

### Vista — Notas del Estudiante (`/dashboard/studentNotes`)

**Propósito:** Consulta y registro de anotaciones académicas formales asociadas a un estudiante específico.

**Captura de pantalla:**

![Vista — Notas del Estudiante](./screenshots/studentNotes.png)

**Roles:** Docente, Coordinador, Director, Administrador.

---

### Vista — Asistencia del Estudiante (`/dashboard/assistenceStudent`)

**Propósito:** Consulta del historial completo de asistencia de un estudiante.

**Captura de pantalla:**

![Vista — Asistencia del Estudiante](./screenshots/assistenceStudent.png)

**Información mostrada:** Fecha, asignatura, estado (Presente / Ausente / Tardanza), docente que registró.

**Roles:** Docente, Coordinador.

---

### Vista — Observador del Estudiante (`/dashboard/observadorEstudiante`)

**Propósito:** Registro de novedades disciplinarias, conductuales o académicas del estudiante.

**Captura de pantalla:**

![Vista — Observador del Estudiante](./screenshots/observadorEstudiante.png)

**Elementos del formulario:**

| Campo       | Descripción                                                   |
| ----------- | ------------------------------------------------------------- |
| Tipo        | Categoría del registro (disciplinario, académico, conductual) |
| Descripción | Relato detallado de la novedad                                |
| Fecha       | Fecha de ocurrencia del evento                                |

**Roles:** Docente, Coordinador, Director.

---

### Vista — Gestión del Observador (`/dashboard/manageObserver`)

**Propósito:** Administración centralizada de todos los registros del observador estudiantil. Permite registrar nuevas observaciones y editar las existentes, filtrando por número de documento del estudiante.

**Captura de pantalla:**

![Vista — Gestión del Observador](./screenshots/manageObserver.png)

**Elementos de la pantalla:**

| Elemento               | Descripción                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| Campo búsqueda         | Búsqueda de observaciones por número de identificación del estudiante  |
| Tabla de observaciones | Identificación, nombre del estudiante, fecha de creación y observación |
| Botón Registrar        | Abre el modal para crear nueva observación                             |
| Botón Editar fila      | Abre el modal de edición de la observación seleccionada                |

**Modales utilizados:**

| Modal                  | Propósito                                                       |
| ---------------------- | --------------------------------------------------------------- |
| `ObservadorEstudiante` | Formulario de registro de nueva observación                     |
| `ProfileObserver`      | Edición de una observación existente (descripción, tipo, fecha) |

**Captura de pantalla:**

![Vista — Gestión del Observador](./screenshots/manageObserver.png)

**Roles:** Administrador, Director, Coordinador.

---

## 5.6 Dominio: Docentes

### Vista — Registrar Docente (`/dashboard/registerTeacher`)

**Propósito:** Incorporar un nuevo docente al sistema con su información personal y asignación institucional.

**Captura de pantalla:**

![Vista — Registrar Docente](./screenshots/registerTeacher.png)

**Elementos del formulario:**

| Campo             | Descripción                                         |
| ----------------- | --------------------------------------------------- |
| Datos personales  | Nombres, apellidos, tipo y número de identificación |
| Sede asignada     | Sede a la que pertenece el docente                  |
| Grado a cargo     | Grado del cual es responsable (si aplica)           |
| Director de grupo | Indicador de si el docente dirige un grupo          |

**Roles:** Administrador, Director.

---

### Vista — Gestión de Docentes (`/dashboard/manageTeacher`)

**Propósito:** Panel CRUD de administración de docentes. Permite consultar el listado completo de docentes de la institución, registrar nuevos y actualizar su información personal y de asignación.

**Captura de pantalla:**

![Vista — Gestión de Docentes](./screenshots/manageTeacher.png)

**Elementos de la pantalla:**

| Elemento          | Descripción                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| Tabla de docentes | ID, nombre completo, sede, estado, grados asignados, asignaturas, director de grado |
| Botón Registrar   | Abre el modal de registro de nuevo docente                                          |
| Botón Ver perfil  | Accede a la vista de perfil completo del docente                                    |
| Botón Actualizar  | Abre el modal de edición con los datos actuales del docente                         |

**Modales utilizados:**

| Modal             | Propósito                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `RegisterTeacher` | Formulario de registro de nuevo docente (datos personales y asignación)                                  |
| `TeacherModal`    | Ver y editar datos completos del docente: información básica, asignaturas asignadas y dirección de grado |

**Captura de pantalla:**

![Vista — Gestión de Docentes](./screenshots/manageTeacher.png)

**Roles:** Administrador, Director.

---

### Vista — Perfil del Docente (`/dashboard/profileTeacher`)

**Propósito:** Vista centralizada con toda la información del docente.

**Captura de pantalla:**

![Vista — Perfil del Docente](./screenshots/profileTeacher.png)

**Secciones del perfil:**

| Sección                 | Contenido                                |
| ----------------------- | ---------------------------------------- |
| Datos personales        | Información de identificación y contacto |
| Asignaturas asignadas   | Materias que imparte con grado y sede    |
| Historial de asistencia | Registro de asistencia del docente       |
| Notas y logros          | Objetivos y calificaciones registradas   |

**Roles:** Administrador, Director, el propio Docente.

---

### Vista — Registrar Asistencia (`/dashboard/registerAssistance`)

**Propósito:** Marcar la asistencia de los estudiantes en una sesión de clase.

**Captura de pantalla:**

![Vista — Registrar Asistencia](./screenshots/registerAssistance.png)

**Flujo de uso:**

1. Seleccionar fecha, asignatura y grupo.
2. El sistema carga el listado de estudiantes del grupo.
3. Marcar el estado de cada estudiante: **Presente**, **Ausente** o **Tardanza**.
4. Guardar el registro.

**Roles:** Docente, Coordinador.

---

### Vista — Gestión de Asistencia (`/dashboard/manageAssistance`)

**Propósito:** Revisión, búsqueda y registro de asistencias estudiantiles previamente guardadas. Permite filtrar por sede, grado, período y rango de fechas.

**Captura de pantalla:**

![Vista — Gestión de Asistencia](./screenshots/manageAssistance.png)

**Elementos de la pantalla:**

| Elemento            | Descripción                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| Filtros de búsqueda | Fecha inicio, fecha fin, sede, grado y período académico                             |
| Tabla de asistencia | Estudiante, asignatura, grado/grupo, fecha, estado (Presente/Ausente), sede, jornada |
| Botón Registrar     | Abre el modal para crear un nuevo registro de asistencia                             |
| Botón Buscar        | Ejecuta la búsqueda con los filtros seleccionados (solo Admin)                       |

> Los **docentes** ven auto-cargados los registros de sus grados cuando completan todos los filtros. Los **administradores** deben presionar “Buscar” manualmente.

**Modales utilizados:**

| Modal                | Propósito                                                 |
| -------------------- | --------------------------------------------------------- |
| `RegisterAssistance` | Formulario de registro de una nueva asistencia por sesión |

**Captura de pantalla:**

![Vista — Gestión de Asistencia](./screenshots/manageAssistance.png)

**Roles:** Coordinador, Administrador.

---

### Vista — Control de Asistencia (`/dashboard/controlAsistencia`)

**Propósito:** Panel consolidado de análisis de asistencia a nivel institucional o por grupo.

**Captura de pantalla:**

![Vista — Control de Asistencia](./screenshots/controlAsistencia.png)

**Información mostrada:** Tasas de asistencia por grupo, grado y período; alertas por ausentismo.

**Roles:** Director, Coordinador, Administrador.

---

### Vista — Gestión de Logros (`/dashboard/manageLogro`)

**Propósito:** Definir y administrar los objetivos evaluativos (logros) por asignatura, grado, período y tipo. El flujo de selectores varía según el rol del usuario.

**Captura de pantalla:**

![Vista — Gestión de Logros](./screenshots/manageLogro.png)

**Elementos de la pantalla:**

| Elemento              | Descripción                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Selectores en cascada | Sede → Grado → Asignatura → Jornada → Período (docentes) o Sede → Jornada → Asignatura → Grado → Período (admin) |
| Selector tipo logro   | Filtra por categoría de logro (cargado dinámicamente)                                                            |
| Tabla de logros       | ID, descripción, asignatura, grado, período, tipo, estado y fecha de creación                                    |
| Botón Registrar       | Abre el modal de registro de nuevo logro                                                                         |
| Botón Editar fila     | Abre el modal de edición del logro seleccionado                                                                  |

**Modales utilizados:**

| Modal          | Propósito                                                              |
| -------------- | ---------------------------------------------------------------------- |
| `ProfileLogro` | Registro y edición de logros (mismo componente para ambas operaciones) |

**Captura de pantalla:**

![Vista — Gestión de Logros](./screenshots/manageLogro.png)

**Roles:** Docente, Coordinador, Administrador.

---

### Vista — Ingresar Calificaciones (`/dashboard/manageNote`)

**Propósito:** Registro y edición de notas de estudiantes por asignatura y período. Soporta notas normales (con porcentaje y logro) y notas de grado transición (con propósito y descripción).

**Captura de pantalla:**

![Vista — Ingresar Calificaciones](./screenshots/manageNote.png)

**Elementos de la pantalla:**

| Elemento               | Descripción                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| Selectores en cascada  | Sede → Grado → Asignatura → Jornada → Período                        |
| Checkbox Transición    | Alterna entre la vista de notas normales y notas de grado transición |
| Tabla notas normales   | ID, nombre de nota, porcentaje (%), logro asociado, estado           |
| Tabla notas transición | ID, propósito, descripción                                           |
| Botón Registrar nota   | Abre el modal de registro de nueva nota                              |
| Botón Asignar notas    | Abre el modal para asignar notas a los estudiantes del grupo         |
| Botón Editar notas     | Disponible solo en modo notas normales; abre el modal de edición     |

**Modales utilizados:**

| Modal                    | Propósito                                                    |
| ------------------------ | ------------------------------------------------------------ |
| `RegisterRecords`        | Registro de una nueva nota (nombre, porcentaje, logro)       |
| `RegisterStudentRecords` | Asignación de notas a los estudiantes del grupo seleccionado |
| `ProfileNote`            | Edición de notas normales existentes                         |
| `ProfileNoteTransition`  | Edición de notas de grado transición                         |

**Captura de pantalla:**

![Vista — Ingresar Calificaciones](./screenshots/manageNote.png)

**Roles:** Docente.

---

### Vista — Gestión de DBA (`/dashboard/manageDBA`)

**Propósito:** Administrar los Derechos Básicos de Aprendizaje definidos para cada propósito educativo de la institución.

**Captura de pantalla:**

![Vista — Gestión de DBA](./screenshots/manageDBA.png)

**Elementos de la pantalla:**

| Elemento        | Descripción                                                    |
| --------------- | -------------------------------------------------------------- |
| Tabla de DBA    | ID y nombre del propósito educativo                            |
| Botón Registrar | Abre el modal para crear un nuevo DBA                          |
| Botón Ver DBA   | Abre el modal con el detalle completo y los estándares del DBA |

**Modales utilizados:**

| Modal         | Propósito                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| `RegisterDBA` | Formulario para registrar un nuevo DBA con su propósito                    |
| `ProfileDBA`  | Vista detallada del DBA seleccionado incluyendo sus estándares desglosados |

**Captura de pantalla:**

![Vista — Gestión de DBA](./screenshots/manageDBA.png)

**Roles:** Docente, Coordinador, Administrador.

---

## 5.7 Dominio: Gestión Escolar

### Vista — Gestión de Instituciones (`/dashboard/manageSchools`)

**Propósito:** Administración de las instituciones educativas registradas en el sistema. Permite crear nuevas instituciones y consultar o editar las existentes.

**Captura de pantalla:**

![Vista — Gestión de Instituciones](./screenshots/manageSchools.png)

**Elementos de la pantalla:**

| Elemento               | Descripción                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| Tabla de instituciones | ID y nombre de cada institución registrada, con contador de total  |
| Botón Agregar          | Abre el modal de registro de nueva institución                     |
| Botón Ver              | Abre el modal en modo solo lectura con los datos de la institución |
| Botón Editar           | Abre el modal en modo edición con los datos actuales               |

**Modales utilizados:**

| Modal                             | Propósito                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ProfileSchool` (modo `register`) | Formulario de registro de nueva institución con nombre, datos generales y configuración de escala |
| `ProfileSchool` (modo `update`)   | Vista y edición de la institución: nombre, logo, colores institucionales y escala de calificación |

**Captura de pantalla:**

![Vista — Gestión de Instituciones](./screenshots/manageSchools.png)

> Los colores institucionales se aplican automáticamente a toda la interfaz del sistema para todos los usuarios de esa institución.

**Roles:** Administrador.

---

### Vista — Perfil de Institución (`/dashboard/profileSchool`)

**Propósito:** Vista detallada y editable de la información completa de la institución.

**Captura de pantalla:**

![Vista — Perfil de Institución](./screenshots/profileSchool.png)

**Secciones:**

| Sección          | Contenido                                                |
| ---------------- | -------------------------------------------------------- |
| Datos generales  | Nombre, NIT, dirección, teléfono                         |
| Identidad visual | Logo (con previsualización), color primario y secundario |
| Escalas          | Configuración de los rangos de calificación              |

**Roles:** Administrador, Director.

---

### Vista — Gestión de Sedes (`/dashboard/manageSedes`)

**Propósito:** Crear y administrar las ubicaciones físicas (sedes) de la institución. Cada sede opera de manera independiente con sus propios grados, jornadas, docentes y estudiantes.

**Captura de pantalla:**

![Vista — Gestión de Sedes](./screenshots/manageSedes.png)

**Elementos de la pantalla:**

| Elemento        | Descripción                                                     |
| --------------- | --------------------------------------------------------------- |
| Tabla de sedes  | ID de sede, nombre, jornada e ID de institución                 |
| Botón Registrar | Abre el modal de registro de nueva sede                         |
| Botón Ver       | Abre el modal con los detalles de la sede seleccionada          |
| Botón Editar    | Abre el modal en modo edición con los datos actuales de la sede |

**Modales utilizados:**

| Modal          | Propósito                                                                          |
| -------------- | ---------------------------------------------------------------------------------- |
| `RegisterSede` | Formulario de registro de nueva sede (nombre, dirección, jornada)                  |
| `SedeModal`    | Ver y editar los datos completos de una sede existente (con flag `initialEditing`) |

**Captura de pantalla:**

![Vista — Gestión de Sedes](./screenshots/manageSedes.png)

**Roles:** Administrador, Director.

---

### Vista — Gestión de Asignaturas (`/dashboard/manageAsignature`)

**Propósito:** Administrar el catálogo de materias ofrecidas por cada sede y jornada. Permite registrar nuevas asignaturas y editar las existentes.

**Captura de pantalla:**

![Vista — Gestión de Asignaturas](./screenshots/manageAsignature.png)

**Elementos de la pantalla:**

| Elemento             | Descripción                                                                  |
| -------------------- | ---------------------------------------------------------------------------- |
| Selector de Sede     | Auto-selecciona la sede del usuario autenticado                              |
| Selector de Jornada  | Auto-selecciona si es única; permite elección si la sede tiene jornada mixta |
| Tabla de asignaturas | ID, nombre, código, jornada, descripción, estado y grados asociados          |
| Botón Registrar      | Abre el modal de registro de nueva asignatura                                |
| Botón Editar fila    | Abre el modal de edición de la asignatura seleccionada                       |

**Modales utilizados:**

| Modal                | Propósito                                                                    |
| -------------------- | ---------------------------------------------------------------------------- |
| `RegisterAsignature` | Formulario de registro de nueva asignatura (nombre, código, grados, jornada) |
| `ProfileAssignature` | Edición de una asignatura existente                                          |

**Captura de pantalla:**

![Vista — Gestión de Asignaturas](./screenshots/manageAsignature.png)

**Roles:** Administrador, Director, Coordinador.

---

### Vista — Gestión de Grados (`/dashboard/manageGrade`)

**Propósito:** Configurar los niveles académicos disponibles en cada sede y jornada de la institución.

**Captura de pantalla:**

![Vista — Gestión de Grados](./screenshots/manageGrade.png)

**Elementos de la pantalla:**

| Elemento            | Descripción                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| Selector de Sede    | Auto-selecciona la sede del usuario autenticado                              |
| Selector de Jornada | Auto-selecciona si es única; permite elección si la sede tiene jornada mixta |
| Tabla de grados     | Nombre del grado, grupo, estado y jornada                                    |
| Botón Registrar     | Abre el modal de registro de nuevo grado                                     |
| Botón Editar fila   | Abre el modal de edición del grado seleccionado                              |

**Modales utilizados:**

| Modal           | Propósito                                                      |
| --------------- | -------------------------------------------------------------- |
| `RegisterGrade` | Formulario de registro de nuevo grado (nombre, grupo, jornada) |
| `ProfileGrade`  | Edición de un grado existente (nombre, grupo, estado)          |

**Captura de pantalla:**

![Vista — Gestión de Grados](./screenshots/manageGrade.png)

**Ejemplos de grados:** Preescolar, Primero, Segundo, … Undécimo, técnico, etc.

**Roles:** Administrador, Director.

---

### Vista — Boletines Académicos (`/dashboard/manageBoletin`)

**Propósito:** Generación y descarga del informe oficial de calificaciones por período para cada estudiante o para todo un curso.

**Captura de pantalla:**

![Vista — Boletines Académicos](./screenshots/manageBoletin.png)

**Elementos de la pantalla:**

| Elemento                 | Descripción                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| Selector de Sede         | Docentes ven sus sedes; admin ve todas las sedes de la institución      |
| Selector de Grado        | Docentes usan sus grados asignados; admin elige de todos los grados     |
| Tabla de estudiantes     | ID, nombre completo del estudiante y grado                              |
| Botón Ver boletín (fila) | Abre el modal con el boletín individual del estudiante seleccionado     |
| Botón Descargar curso    | Abre el modal para descargar todos los boletines del curso seleccionado |

**Modales utilizados:**

| Modal                             | Propósito                                                        |
| --------------------------------- | ---------------------------------------------------------------- |
| `BoletinSelector` (modo `single`) | Visualización y descarga del boletín individual de un estudiante |
| `BoletinSelector` (modo `all`)    | Descarga masiva de todos los boletines del curso en un solo lote |

**Captura de pantalla:**

![Vista — Boletines Académicos](./screenshots/manageBoletin.png)

> Los boletines incluyen automáticamente el logo y los colores institucionales configurados.

**Flujo de uso:**

1. Seleccionar el **período**, la **sede** y el **grado**.
2. El sistema consolida notas, logros y asistencia del período.
3. Previsualizar el boletín antes de descargarlo.
4. Descargar:
   - **Individual:** un PDF por estudiante seleccionado.
   - **Masivo:** todos los boletines del grado agrupados.

**Roles:** Administrador, Director, Coordinador.

---

### Vista — Hoja de Vida Académica (`/dashboard/registerStudentRecords`)

**Propósito:** Registro del historial académico completo del estudiante dentro de la institución.

**Captura de pantalla:**

![Vista — Hoja de Vida Académica](./screenshots/registerStudentRecords.png)

**Roles:** Administrador, Coordinador.

---

## 5.8 Dominio: Registros Académicos

### Vista — Asignar Asignaturas (`/dashboard/registerAsignature`)

**Propósito:** Configurar qué docente imparte qué asignatura, a qué grupo y en qué período.

**Captura de pantalla:**

![Vista — Asignar Asignaturas](./screenshots/registerAsignature.png)

**Flujo de uso:**

1. Seleccionar docente, asignatura, grado y período.
2. Confirmar la asignación.
3. A partir de este momento el docente puede ingresar calificaciones para esa asignatura.

**Roles:** Administrador, Director, Coordinador.

---

### Vista — Registrar Calificaciones (`/dashboard/registerRecords`)

**Propósito:** Consolidar los resultados de evaluaciones en el historial académico del sistema.

**Captura de pantalla:**

![Vista — Registrar Calificaciones](./screenshots/registerRecords.png)

**Roles:** Docente, Coordinador.

---

## 5.9 Funcionalidades Transversales

Estas funcionalidades están presentes en múltiples vistas del sistema y son parte central de la experiencia del usuario.

### Sistema de Notificaciones

El sistema muestra notificaciones contextuales en la esquina de la pantalla ante cualquier operación:

| Tipo        | Color    | Cuando aparece                                           |
| ----------- | -------- | -------------------------------------------------------- |
| Éxito       | Verde    | La operación se completó correctamente                   |
| Error       | Rojo     | La operación falló (datos inválidos, error del servidor) |
| Advertencia | Amarillo | La operación completó con observaciones                  |
| Información | Azul     | Mensajes informativos del sistema                        |

Las notificaciones desaparecen automáticamente. El sistema agrupa notificaciones duplicadas dentro de una ventana de 600 ms para no saturar la pantalla.

---

### Tours Guiados Interactivos

Cada módulo principal del sistema cuenta con un tour guiado paso a paso (powered by Driver.js) que:

- Resalta visualmente cada elemento de la pantalla.
- Muestra una descripción contextual de su función.
- Permite avanzar, retroceder o saltar el tour.

**Módulos con tour disponible:**

| Módulo                    | Tour disponible        |
| ------------------------- | ---------------------- |
| Gestionar Asignatura      | tourManageAsignature   |
| Registrar Asistencia      | tourRegisterAssistance |
| Gestionar Asistencia      | tourManageAssistance   |
| Ingresar Calificaciones   | tourManageGrade        |
| Gestionar Logro           | tourManageLogro        |
| Gestionar Nota            | tourManageNote         |
| Observador del Estudiante | tourManageObserver     |
| Gestionar Instituciones   | tourManageSchools      |
| Gestionar Sedes           | tourManageSedes        |
| Gestionar Estudiantes     | tourManageStudent      |
| Gestionar Docentes        | tourManageTeacher      |
| Perfil Asignatura         | tourProfileAssignature |
| Perfil Grado              | tourProfileGrade       |
| Perfil Estudiante         | tourProfileStudent     |
| Perfil Docente            | tourProfileTeacher     |
| Perfil Institución        | tourProfileSchool      |
| Registrar Estudiante      | tourRegisterStudent    |
| Reserva de Cupo           | tourReserveSpot        |

---

### Personalización Visual Institucional

Cada institución puede configurar sus propios **colores primario y secundario** y su **logotipo**. Estas configuraciones se aplican automáticamente a toda la interfaz del sistema para todos los usuarios pertenecientes a esa institución, sin necesidad de recargar la página.

---

### Exportación a PDF y Excel

Disponible en múltiples módulos del sistema:

| Formato | Dónde se usa                                                      |
| ------- | ----------------------------------------------------------------- |
| PDF     | Boletines, carnés estudiantiles, reportes institucionales, perfil |
| Excel   | Reportes de calificaciones, asistencia, listados de estudiantes   |

Los PDFs se generan directamente en el navegador del usuario, sin necesidad de procesar en el servidor.

---

### Captura de Fotografía

Disponible en el registro de estudiantes y en el perfil estudiantil. Permite tomar la foto directamente desde la cámara del dispositivo (requiere permiso de cámara del navegador). La imagen queda vinculada al perfil del estudiante.

---

### Firma Digital

Disponible en el registro de acudientes y en la reserva de cupos. El acudiente dibuja su firma en un canvas digital. La firma queda almacenada como imagen y vinculada al registro del estudiante.

---

## 5.10 Flujos Clave del Sistema

### Flujo 1 — Autenticación y acceso

```
1. Usuario navega a /login
2. Ingresa email y contraseña
3. El sistema hashea la contraseña con SHA-256 en el navegador
4. Envía POST /auth/login al servidor
5. El servidor valida y retorna: token JWT, datos del usuario, menú según rol, tema institucional
6. El sistema persiste los datos en localStorage
7. Se aplican los colores institucionales y se carga el menú dinámico
8. Redirección automática a /dashboard/home
```

### Flujo 2 — Registro completo de estudiante

```
1. Administrador navega a /dashboard/registerStudent
2. Completa el formulario multi-sección con datos personales y académicos
3. (Opcional) Captura foto del estudiante con la cámara
4. POST /students → el servidor crea el registro
5. Redirección a /dashboard/registerParents
6. Completa datos del acudiente y acepta términos
7. Captura firma digital del acudiente
8. POST /uploadfirma/acudientes → la firma queda registrada
9. El sistema muestra notificación de éxito
```

### Flujo 3 — Ingreso de calificaciones

```
1. Docente navega a /dashboard/manageNote
2. Selecciona asignatura, período académico y grupo
3. El sistema carga la tabla con todos los estudiantes del grupo
4. El docente ingresa la nota de cada estudiante
5. Guarda los cambios → la API actualiza los registros
6. El sistema notifica éxito o errores por cada fila
```

### Flujo 4 — Generación de boletín

```
1. Coordinador navega a /dashboard/manageBoletin
2. Selecciona período, sede y grado
3. El sistema consolida notas, logros y asistencia del período
4. Se muestra una vista previa del boletín con logo y colores institucionales
5. El Coordinador descarga el boletín en PDF
   - Individual: un PDF por estudiante
   - Masivo: todos los boletines del grado agrupados
```

### Flujo 5 — Reserva de cupo (público)

```
1. Acudiente accede a /reserveSpot desde el enlace compartido por la institución
2. Completa los datos del estudiante prospecto y del acudiente
3. Lee y acepta los términos y condiciones
4. Firma digitalmente en el área habilitada
5. POST /slots → el servidor registra la solicitud
6. El sistema confirma el registro del cupo
```

---

## 5.11 Resumen de Funcionalidades por Rol

| Funcionalidad                     | Admin | Director | Coordinador | Docente | Acudiente |
| --------------------------------- | :---: | :------: | :---------: | :-----: | :-------: |
| Login / Recuperar contraseña      |   ✔   |    ✔     |      ✔      |    ✔    |     ✔     |
| Ver panel principal               |   ✔   |    ✔     |      ✔      |    ✔    |           |
| Registrar / gestionar usuarios    |   ✔   |    ✔     |             |         |           |
| Registrar estudiante (individual) |   ✔   |    ✔     |      ✔      |         |           |
| Registrar estudiante (Excel)      |   ✔   |    ✔     |             |         |           |
| Ver perfil del estudiante         |   ✔   |    ✔     |      ✔      |    ✔    |    ✔\*    |
| Gestionar (editar/eliminar) estud |   ✔   |    ✔     |             |         |           |
| Registrar acudiente               |   ✔   |    ✔     |      ✔      |         |           |
| Registrar / gestionar docente     |   ✔   |    ✔     |             |         |           |
| Ver perfil del docente            |   ✔   |    ✔     |             |   ✔\*   |           |
| Ingresar calificaciones           |       |          |             |    ✔    |           |
| Registrar asistencia              |       |          |      ✔      |    ✔    |           |
| Gestionar asistencia              |   ✔   |          |      ✔      |         |           |
| Control / análisis asistencia     |   ✔   |    ✔     |      ✔      |         |           |
| Gestionar logros                  |   ✔   |          |      ✔      |    ✔    |           |
| Gestionar DBA                     |   ✔   |          |      ✔      |    ✔    |           |
| Observador del estudiante         |   ✔   |    ✔     |      ✔      |    ✔    |           |
| Gestionar instituciones y sedes   |   ✔   |    ✔     |             |         |           |
| Gestionar grados y asignaturas    |   ✔   |    ✔     |      ✔      |         |           |
| Generar boletines                 |   ✔   |    ✔     |      ✔      |         |           |
| Generar reportes                  |   ✔   |    ✔     |      ✔      |         |           |
| Auditoría del sistema             |   ✔   |    ✔     |             |         |           |
| Reserva de cupos                  |   —   |    —     |      —      |    —    |     ✔     |

> \* El Docente solo puede ver su propio perfil. El Acudiente solo puede ver el perfil del estudiante a su cargo.
