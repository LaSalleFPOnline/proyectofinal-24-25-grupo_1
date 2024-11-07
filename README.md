## Prerrequisitos

- Docker Desktop https://docs.docker.com/compose/install/#scenario-one-install-docker-desktop

## Funcionamiento

- Clona el repositorio
- Accede a la carpeta api y ejecuta `npm install`
- Accede a la carpeta client y ejecuta `npm install`
- Inicia el contenedor de la aplicación con `docker-compose up -d`

## Configuración de Docker Compose

El archivo `docker-compose.yml` incluye la configuración para todos los servicios:

- **client**: Servidor Nginx para la aplicación Angular.
- **api**: API Node.js con conexión a MySQL.
- **phpmyadmin**: Interfaz de administración de MySQL.
- **db**: Contenedor de MySQL para la base de datos.
- **nginx**: Proxy inverso para enrutar las solicitudes al frontend y la API.

## Servicios en el Proyecto

### 1. Client (Angular)

La aplicación Angular se compila y se sirve desde Nginx. 

### 2. API (Node.js)

La API está construida con Node.js y utiliza Express. Se conecta a la base de datos MySQL.

### 3. MySQL

MySQL es la base de datos principal. Está configurada para recibir las variables de entorno para el nombre de la base de datos, el usuario y la contraseña.

### 4. phpMyAdmin

phpMyAdmin permite la administración de la base de datos MySQL a través de una interfaz gráfica.

### 5. Nginx

Nginx sirve la aplicación Angular y realiza el proxy inverso hacia la API de Node.js. La configuración del archivo `nginx.conf` define el enrutamiento.

## Uso

### 1. Clona el repositorio y navega al directorio del proyecto.

### 2. Asegúrate de que todos los servicios están configurados correctamente y que las variables de entorno (credenciales de la base de datos) estén configuradas en docker-compose.yml y en los archivos de conexión de la API.

### 3. Ejecuta el proyecto con: `docker compose up --build -d`

### 4. La aplicación estará disponible en los siguientes puertos:

- **Puerto 3050:** Servidor de Angular.
- **Puerto 5000:** API de Node.js.
- **Puerto 8080:** PhpMyAdmin.

## Notas

- Si encuentras errores de conexión con MySQL (ECONNREFUSED o ETIMEDOUT), verifica que DB_HOST en la configuración de la API esté configurado como db o la IP que aparece en Docker Desktop, el nombre del servicio en `docker-compose.yml`.
- Para reconstruir el proyecto sin caché, usa: `docker compose down y docker compose up --build -d`.

## Comandos útiles

- `docker system prune --all --volumes --force`: Limpia todos los contenedores y imágenes de Docker.
- `docker compose down`: Detiene todos los servicios de Docker Compose.
- `docker compose up --build -d`: Inicia todos los servicios de Docker Compose y construye los contenedores si no existen.