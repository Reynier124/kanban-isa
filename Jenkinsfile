pipeline {
    agent any
    environment {
        DOCKER_IMAGE = 'reynier124/kanban-isa'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        MAVEN_OPTS = "-Xmx2048m"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                dir('Backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests -Dskip.npm -Dskip.installnodenpm -B'
                }
            }
        }
        stage('Test') {
            steps {
                dir('Backend') {
                    sh './mvnw test -Dskip.npm -Dskip.installnodenpm'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'Backend/target/surefire-reports/**/*.xml'
                }
            }
        }
        stage('Package') {
            steps {
                dir('Backend') {
                    sh './mvnw -ntp -Pprod clean package -DskipTests -Dskip.npm -Dskip.installnodenpm'
                }
            }
        }
        stage('E2E Tests') {
            steps {
                script {
                    // Levantar servicios necesarios para los tests
                    sh '''
                        cd docker/compose
                        docker compose up -d --build app frontend postgres
                        echo "⏳ Esperando que los servicios estén listos..."
                        sleep 30
                    '''

                    // Esperar que el backend responda
                    sh '''
                        echo "⏳ Esperando backend en puerto 8080..."
                        for i in $(seq 1 20); do
                            if curl -sf http://kanban-app:8080/management/health; then
                                echo "✅ Backend listo"
                                break
                            fi
                            echo "Intento $i/20..."
                            sleep 10
                        done
                    '''

                    // Esperar que el frontend responda
                    sh '''
                        echo "⏳ Esperando frontend..."
                        for i in $(seq 1 10); do
                            if curl -sf http://kanban-frontend:80; then
                                echo "✅ Frontend listo"
                                break
                            fi
                            echo "Intento $i/10..."
                            sleep 5
                        done
                    '''

                    // Correr Cypress en contenedor oficial dentro de la misma red
                    sh '''
                        cd kanban-ionic
                        docker run --rm \
                            --network kanban-network \
                            -v $PWD:/e2e \
                            -w /e2e \
                            -e CYPRESS_baseUrl=http://kanban-frontend:80 \
                            -e CYPRESS_apiUrl=http://kanban-app:8080 \
                            cypress/included:15.11.0 \
                            --browser electron \
                            --headless
                    '''
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'kanban-ionic/cypress/screenshots',
                        reportFiles: '**/*.png',
                        reportName: 'Cypress Screenshots'
                    ])
                }
                failure {
                    echo "❌ Tests E2E fallaron. Revisá los screenshots."
                }
                cleanup {
                    sh 'cd docker/compose && docker compose down || true'
                }
            }
        }
        stage('Publish Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_REGISTRY_PWD', usernameVariable: 'DOCKER_REGISTRY_USER')]) {
                    dir('Backend') {
                        sh "./mvnw -ntp jib:build -Djib.to.image=${DOCKER_IMAGE}:${DOCKER_TAG} -Djib.to.tags=latest,${DOCKER_TAG} -Djib.to.auth.username=${DOCKER_REGISTRY_USER} -Djib.to.auth.password=${DOCKER_REGISTRY_PWD}"
                    }
                }
            }
        }
    }
    post {
        success {
            echo "✅ Pipeline completado exitosamente! Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
        }
        failure {
            echo "❌ Pipeline fallido!"
        }
        always {
            script {
                try {
                    cleanWs()
                } catch (Exception e) {
                    echo "⚠️ No se pudo limpiar el workspace: ${e.message}"
                }
            }
        }
    }
}
