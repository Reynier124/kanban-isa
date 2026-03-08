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
                    def workspaceDir = pwd()

                    // Levantar servicios
                    sh """
                        cd ${workspaceDir}/Docker/compose
                        docker compose up -d --build app frontend postgres
                        echo "⏳ Esperando servicios..."
                        sleep 30
                    """

                    // Esperar backend
                    sh """
                        echo "⏳ Esperando backend..."
                        for i in \$(seq 1 20); do
                            if docker exec kanban-app curl -sf http://localhost:8080/management/health 2>/dev/null; then
                                echo "✅ Backend listo"
                                break
                            fi
                            echo "Intento \$i/20..."
                            sleep 10
                        done
                    """

                    // Esperar frontend
                    sh """
                        echo "⏳ Esperando frontend..."
                        for i in \$(seq 1 10); do
                            if docker exec kanban-frontend curl -sf http://localhost:80 2>/dev/null; then
                                echo "✅ Frontend listo"
                                break
                            fi
                            echo "Intento \$i/10..."
                            sleep 5
                        done
                    """

                    // Correr Cypress
                    sh """
                        docker run --rm \
                            --network kanban-network \
                            -v ${workspaceDir}/kanban-ionic:/e2e \
                            -w /e2e \
                            -e CYPRESS_baseUrl=http://kanban-frontend:80 \
                            -e CYPRESS_apiUrl=http://kanban-app:8080 \
                            cypress/included:15.11.0 \
                            --browser electron \
                            --headless
                    """
                }
            }
            post {
                failure {
                    echo "❌ Tests E2E fallaron. Revisá los screenshots en kanban-ionic/cypress/screenshots"
                }
                cleanup {
                    script {
                        def workspaceDir = pwd()
                        sh "cd ${workspaceDir}/docker/compose && docker compose down || true"
                    }
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
