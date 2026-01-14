# Sistema de Notificaciones - Guía de Uso

## Descripción General

Se ha implementado un sistema centralizado de notificaciones que valida automáticamente cada respuesta del API. Cuando el backend responde con un `code` diferente a "OK", se muestra automáticamente una notificación de error al usuario.

## Validación Automática en ApiClient

### ¿Cómo funciona?

El interceptor de respuestas en `ApiClient.js` valida automáticamente cada respuesta:

```javascript
// ✅ Si el código es "OK", la petición continúa normalmente
// ❌ Si el código NO es "OK", se rechaza y se muestra notificación
if (data.code !== "OK") {
  // Se emite automáticamente una notificación de error
  eventBus.emit(errorMessage, "error");
  return Promise.reject(error);
}
```

### Estructura de Respuesta Esperada

El backend debe responder con la siguiente estructura:

```json
{
  "code": "OK",
  "mensaje": "Operación exitosa",
  "data": { ... }
}
```

Si el `code` no es "OK", se mostrará el mensaje de error al usuario.

## Uso Manual de Notificaciones

### En Componentes Funcionales

Puedes usar el hook `useNotify` para mostrar notificaciones manualmente:

```jsx
import { useNotify } from "../lib/hooks/useNotify";

function MiComponente() {
  const notify = useNotify();

  const handleSuccess = () => {
    notify.success("¡Operación completada exitosamente!");
  };

  const handleError = () => {
    notify.error("Ha ocurrido un error");
  };

  const handleWarning = () => {
    notify.warning("Advertencia importante");
  };

  const handleInfo = () => {
    notify.info("Información relevante");
  };

  return (
    // ... tu componente
  );
}
```

### En Funciones de Servicio

Si necesitas mostrar notificaciones desde servicios (aunque generalmente se manejan automáticamente):

```javascript
import { eventBus } from "./ApiClient";

export async function miServicio() {
  try {
    const result = await ApiClient.get("/endpoint");
    // ✅ Si el code es "OK", esto se ejecuta
    eventBus.emit("Operación exitosa", "success");
    return result;
  } catch (error) {
    // ❌ Los errores ya emiten notificaciones automáticamente
    // pero puedes personalizar el mensaje si lo necesitas
    throw error;
  }
}
```

## Tipos de Notificaciones

### Error (Rojo)

```javascript
notify.error("Mensaje de error");
```

- Duración predeterminada: 5 segundos
- Se usa automáticamente cuando el `code !== "OK"`

### Success (Verde)

```javascript
notify.success("Mensaje de éxito");
```

- Duración predeterminada: 3 segundos
- Úsalo para confirmar operaciones exitosas

### Warning (Amarillo)

```javascript
notify.warning("Mensaje de advertencia");
```

- Duración predeterminada: 4 segundos
- Úsalo para alertas que requieren atención

### Info (Azul)

```javascript
notify.info("Mensaje informativo");
```

- Duración predeterminada: 3 segundos
- Úsalo para información general

## Personalizar Duración

Todos los métodos aceptan un segundo parámetro para personalizar la duración en milisegundos:

```javascript
// Mostrar por 10 segundos
notify.error("Error importante", 10000);

// Mostrar indefinidamente (requiere cerrar manualmente)
notify.info("Mensaje permanente", 0);
```

## Manejo de Errores en Try-Catch

```javascript
import { useNotify } from "../lib/hooks/useNotify";

function MiComponente() {
  const notify = useNotify();

  const handleSubmit = async () => {
    try {
      const result = await miServicio();
      // ✅ Éxito - mostrar confirmación
      notify.success("Datos guardados correctamente");
    } catch (error) {
      // ❌ Error - ya se mostró notificación automática
      // Solo necesitas manejar la lógica adicional si es necesario
      console.error("Error:", error);
    }
  };

  return (
    // ... tu componente
  );
}
```

## Ejemplo Completo

```jsx
import { useState } from "react";
import { useNotify } from "../lib/hooks/useNotify";
import { registerStudent } from "../services/studentService";

function RegisterStudent() {
  const notify = useNotify();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await registerStudent(formData);

      // ✅ Si llegó aquí, el code fue "OK"
      notify.success("Estudiante registrado exitosamente");

      // Limpiar formulario o redirigir
      setFormData({});
    } catch (error) {
      // ❌ El error ya mostró una notificación automáticamente
      // Solo maneja la lógica adicional si es necesario
      console.error("Error al registrar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos del formulario ... */}
      <button type="submit" disabled={loading}>
        {loading ? "Registrando..." : "Registrar"}
      </button>
    </form>
  );
}

export default RegisterStudent;
```

## Ventajas del Sistema

1. **Validación Centralizada**: Todas las respuestas se validan automáticamente en un solo lugar
2. **Consistencia**: Todos los errores se muestran de la misma manera en toda la aplicación
3. **Menos Código**: No necesitas escribir try-catch y manejo de errores en cada componente
4. **Experiencia de Usuario**: Notificaciones visuales claras y consistentes
5. **Personalizable**: Puedes mostrar notificaciones adicionales cuando lo necesites

## Notas Importantes

- ✅ Las notificaciones de error se muestran **automáticamente** cuando `code !== "OK"`
- ✅ Las notificaciones se cierran automáticamente después de la duración especificada
- ✅ El usuario puede cerrar manualmente cualquier notificación haciendo clic en la "X"
- ✅ Se pueden mostrar múltiples notificaciones simultáneamente
- ✅ Las notificaciones son responsivas y se adaptan a pantallas móviles
