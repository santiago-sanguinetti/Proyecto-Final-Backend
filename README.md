# Proyecto Final Backend
## Actualización: 30 de Diciembre, 2023
### Notas
La funcionalidad para resetear la contraseña por ahora solo funciona teniendo la app corriendo localmente.
Los tests funcionan solo si se configura un usuario Premium para los mismos.
Para probar los endpoints desde Postman o similar se requiere hacer el login y enviar el token recibido como Bearer Token al endpoint, además de enviar `Accept: application/json` en los headers de la solicitud.

### Nuevas Funcionalidades
El proyecto ha sido actualizado con nuevas funcionalidades y algunas correcciones menores.

### Despliegue
La aplicación está desplegada en Railway.app. Puedes acceder a ella a través del siguiente enlace:
[Proyecto Final Backend](https://proyecto-final-backend-production-b2bf.up.railway.app/login)

### Nuevos Endpoints
- `GET /api/users`: Este endpoint permite obtener todos los usuarios, mostrando solo sus datos principales.
- `DELETE /api/users`: Este endpoint permite eliminar a todos los usuarios de la base de datos que no hayan tenido actividad en los últimos 2 días.

### Nuevas Vistas
Se han agregado nuevas vistas y se han corregido las ya existentes:
- `/adminview`: Esta vista permite al administrador cambiar el rol o eliminar usuarios existentes en la base de datos.
- Se han agregado todas las vistas necesarias para un flujo de compras. El flujo es el siguiente:
    1. Inicia sesión en la aplicación.
    2. Navega hacia productos y agrégalos a tu carrito.
    3. Navega hacia el carrito. Aquí puedes eliminar productos del carrito o finalizar la compra.
    4. Visualiza los detalles de la compra.

### Seguridad
Se implementó una medida de seguridad para evitar que los documentos de la base de datos se pudieran buscar por cualquiera de sus atributos.

### Cambios Menores
Se agregaron datos relevantes para la aplicación al DTO de usuarios.


## Uso

1. Descarga o clona este repositorio a tu máquina local:
   ```bash
   git clone https://github.com/santiago-sanguinetti/Proyecto-Final-Backend.git
   ```
2. Abre una terminal en la ubicación del repositorio clonado.
   
3. Instala las dependencias utilizando npm:
   ```bash
   npm install
   ```
4. Inicia el servidor con
   ```bash
   npm start
   ```
