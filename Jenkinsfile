pipeline {
    agent any

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'security -v unlock-keychain ~/Library/Keychains/login.keychain-db'
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('Check Running Containers') {
            steps {
                script {
                    sh 'docker ps'
                }
            }
        }
    }
}

post {
    always {
        script {
            sh 'docker-compose down'
        }
    }
}