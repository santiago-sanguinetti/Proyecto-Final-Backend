# Backend-ProyectoFinal
### Actualización 23/11/2023
## Nuevas funcionalidades de esta entrega

El proyecto ahora incluye las siguientes funcionalidades:

- Se implementó una función para restablecer la contraseña de un usuario
- Nuevo rol para usuarios: `premium`
- Los productos ahora cuentan con un campo `owner` que indica el id del usuario que lo creó
- Nuevos permisos requeridos para el acceso de algunos endpoints
- Los productos ahora solo se pueden borrar si el usuario es `admin`, o `premium` y `owner` del producto
- Los usuarios  `premium` no pueden agregar sus propios productos al carrito
- Nueva ruta: `/api/users/premium/:uid`
  - Permite cambiar el rol del usuario (con id: `uid`) entre `usuario` y `premium`

## Correcciones y cambios menores

- Se corrigió un error por el que no se mostraban (o se mostraban incorrectamente) los logs en algunos endpoints

## Uso

1. Descarga o clona este repositorio a tu máquina local:
   ```bash
   git clone -b entrega/clase_37 https://github.com/santiago-sanguinetti/Backend-ProyectoFinal.git
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