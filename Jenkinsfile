pipeline {
    agent any
    options {
        timestamps()
        disableConcurrentBuilds()
    }
    environment {
        IMAGE_NAME = 'bhaveshpay-web'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build image') {
            steps {
                sh 'docker build --pull -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .'
            }
        }
        stage('Login and push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    sh '''
                        set +x
                        echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
                        docker tag "$IMAGE_NAME:$BUILD_NUMBER" "$DOCKERHUB_USER/$IMAGE_NAME:$BUILD_NUMBER"
                        docker tag "$IMAGE_NAME:latest" "$DOCKERHUB_USER/$IMAGE_NAME:latest"
                        docker push "$DOCKERHUB_USER/$IMAGE_NAME:$BUILD_NUMBER"
                        docker push "$DOCKERHUB_USER/$IMAGE_NAME:latest"
                        docker logout
                    '''
                }
            }
        }
        stage('Deploy to Swarm') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    sh '''
                        export IMAGE_TAG=latest
                        docker stack deploy --with-registry-auth -c docker-compose.yml bhaveshpay-stack
                    '''
                }
            }
        }
    }
    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}
