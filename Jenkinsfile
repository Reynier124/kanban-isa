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
