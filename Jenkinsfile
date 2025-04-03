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
                    sleep(10)
                    sh 'docker-compose exec build-pipeline-news-aggregator-backend npm i'
                    sh 'docker-compose exec build-pipeline-news-aggregator-backend npm test'
                }
            }
        }
    }
}