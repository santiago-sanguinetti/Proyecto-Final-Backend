# Backend-ProyectoFinal
### Actualización 12/11/2023
## Nuevas funcionalidades de esta entrega

El proyecto ahora incluye las siguientes funcionalidades:

- Se implementó un sistema de logging mediante winston
- Nuevo endpoint: `/loggerTest`
  - Permite testear el nuevo sistema de logging en consola
  - Para cambiar entre entorno de desarrollo y productivo cambiar la variable de entorno correspondiente

## Correcciones y cambios menores

- Ahora se contemplan más cantidad de errores
- Ahora se incluye un código HTTP en el estado de los errores
- Se corrigieron nombres de archivos que no seguían la nomenclatura del resto

## Uso

1. Descarga o clona este repositorio a tu máquina local:
   ```bash
   git clone -b entrega/clase_34 https://github.com/santiago-sanguinetti/Backend-ProyectoFinal.git
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