# Backend-ProyectoFinal
### Actualización 30/11/2023
## Nuevas funcionalidades de esta entrega

El proyecto ahora incluye las siguientes funcionalidades:

- La API ahora cuenta con documentación para el módulo de productos y de carritos
  - Se puede acceder a la documentación mediante el endpoint `/apidocs`
- Se realizó una refactorización al método de autenticación y autorización
  - Ahora se autentica y autoriza al usuario mediante un bearer token en lugar de una cookie

## Correcciones y cambios menores

- Se corrigió un error por el que no se podía eliminar productos si el usuario tenía rol de admin

## Uso

1. Descarga o clona este repositorio a tu máquina local:
   ```bash
   git clone -b entrega/clase_40 https://github.com/santiago-sanguinetti/Backend-ProyectoFinal.git
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