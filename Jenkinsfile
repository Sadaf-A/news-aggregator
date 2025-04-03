pipeline {
    agent any

    stages {
        stage('Build Docker Image') {
            steps {
                script {
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

        stage('Run Backend Tests') {
            steps {
                script {
                    sh 'docker-compose exec news-aggregator-backend npm ci'
                    sh 'docker-compose exec news-aggregator-backend npm test'
                }
            }
        }
    }
}
