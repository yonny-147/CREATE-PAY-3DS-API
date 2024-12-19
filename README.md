# ePayco 3D Secure Payment Integration

Este proyecto implementa una solución de integración para pagos seguros utilizando la API de ePayco y la funcionalidad de 3D Secure (3DS). Con esta integración, los usuarios pueden realizar pagos con tarjetas de crédito, generar tokens de tarjeta y procesar transacciones de manera segura y eficiente.

## 🚀 Funcionalidades principales

- **Formateo de entrada de tarjeta y monto**: Permite que los campos de entrada se presenten con un formato claro y legible.
- **Tokenización de tarjetas**: Genera un token único para la tarjeta ingresada, garantizando mayor seguridad.
- **Procesamiento de pagos**: Maneja el flujo completo del pago, incluyendo la validación 3DS cuando es necesaria.
- **Almacenamiento seguro de tokens**: Utiliza `localStorage` para manejar el token de autenticación.
- **Validación de transacciones**: Lógica implementada para manejar la respuesta de la API y verificar el estado del pago.

---

## 📋 Requisitos previos

Antes de comenzar, asegúrate de contar con lo siguiente:

1. **Clave pública y privada de ePayco**: Necesarias para autenticar las solicitudes a la API.
2. **Servidor local o entorno de desarrollo**: Para ejecutar el proyecto.
3. **Token de autenticación**: Generado a través de la API de ePayco utilizando las credenciales.
