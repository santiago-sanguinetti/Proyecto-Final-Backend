# Backend-ProyectoFinal
### Actualización 19/12/2023
## Nuevas funcionalidades de esta entrega

El proyecto ha sido actualizado con nuevas funcionalidades y correcciones menores.

Se ha implementado un nuevo endpoint para el manejo de documentos del usuario.

### Endpoint: `/api/users/:uid/documents`

Este endpoint recibe los siguientes parámetros:

- Params: `:uid` (ID de usuario de Mongo)
- Body (form-data): `type: Text` (tipo de archivo), que puede ser uno de los siguientes:
  - `document`
  - `product`
  - `profile`
- Body (form-data): `files: File` (archivos)

### Usuarios

Ahora los usuarios poseen nuevas propiedades: 
- `last_connection` se actualiza cada vez que el usuario realiza login o logout
- `status` indica si el usuario ya subió algún archivo
- `documents` lista de archivos subidos por el usuario

## Correcciones y Cambios Menores

Se ha revertido un cambio en el logger que mostraba objetos desestructurados, ya que estaba causando problemas.

Ahora el endpoint `/api/sessions/premium/:uid` requiere que el usuario haya subido al menos un archivo de cada tipo para cambiar de `usuario` a `premium`.

## Uso

1. Descarga o clona este repositorio a tu máquina local:
   ```bash
   git clone -b entrega/clase_44 https://github.com/santiago-sanguinetti/Backend-ProyectoFinal.git
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