# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Install Node.js for frontend build
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
# Copy all necessary files for build
COPY pom.xml .
COPY sonar-project.properties .
COPY package.json* ./
COPY angular.json* ./
COPY tsconfig*.json* ./
COPY ngsw-config.json ./
COPY webpack/ ./webpack/
COPY src ./src
# Build with prod profile to include PostgreSQL driver
RUN mvn clean package -Pprod -DskipTests -B
# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar
# Expose port
EXPOSE 8080
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
