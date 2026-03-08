# KanbanApp — ISA

Trabajo final para Ingeniería de Software Aplicada.

Aplicación Kanban full-stack con backend Spring Boot, frontend Ionic PWA, pipeline CI/CD con Jenkins y monitoreo con ELK stack.

---

## Requisitos previos

- **Docker** y **Docker Compose** (obligatorio)
- **Java 17+** (para desarrollo local del backend)
- **Node 20+** y **npm** (para desarrollo local del frontend)

---

## Levantar el proyecto con Docker

```bash
git clone https://github.com/Reynier124/kanban-isa
cd kanban-isa/Docker/compose
docker compose up -d --build
```

Esperar 1-2 minutos a que el backend termine de iniciar. Luego acceder a:

| Servicio    | URL                      |
|-------------|--------------------------|
| Frontend    | http://localhost:4200    |
| Backend API | http://localhost:8080    |
| Jenkins     | http://localhost:8090    |
| Kibana      | http://localhost:5601    |

**Credenciales por defecto:** `admin` / `admin`

---

## Desarrollo local

### Backend

```bash
cd Backend
./mvnw
```

El backend levanta en `http://localhost:8080` con base de datos H2 en memoria.

### Frontend Ionic

```bash
cd kanban-ionic
npm install
ionic serve
```

El frontend levanta en `http://localhost:4200` apuntando al backend en `localhost:8080`.

---

## Tests

### Tests unitarios (backend)

```bash
cd Backend
./mvnw test
```

### Tests E2E con Cypress

Requiere tener el backend y el frontend corriendo (Docker o local).

```bash
cd kanban-ionic
npx cypress run        # modo headless
npx cypress open       # modo interactivo
```

---

## Jenkins — primera configuración

1. Acceder a `http://localhost:8090`
2. Obtener la contraseña inicial:
   ```bash
   docker exec kanban-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Instalar los plugins sugeridos
4. Crear un pipeline apuntando a este repositorio — el `Jenkinsfile` está en la raíz
5. Agregar credencial de DockerHub con ID `dockerhub-credentials`

El pipeline ejecuta: Checkout → Build → Test → Package → Publish Docker Image

---

## Estructura del proyecto

```
kanban-isa/
├── Backend/          # Spring Boot + JHipster
├── kanban-ionic/     # Frontend Ionic PWA
│   └── cypress/      # Tests E2E
├── Docker/
│   ├── compose/      # docker-compose.yml
│   └── elk/          # Configuración ELK (Elasticsearch, Logstash, Kibana, Filebeat)
└── Jenkinsfile       # Pipeline CI/CD
```

---

## Detener los servicios

```bash
cd Docker/compose
docker compose down
```
