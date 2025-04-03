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
                    sh 'docker-compose exec build-pipeline-news-aggregator-backend-1 npm i'
                    sh 'docker-compose exec build-pipeline-news-aggregator-backend-1 npm test'
                }
            }
        }
    }
}