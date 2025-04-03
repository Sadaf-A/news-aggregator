pipeline {
    agent {
        docker {
            image 'node:22.14.0-alpine3.21'
        }
    }

    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/Sadaf-A/news-aggregator.git'
            }
        }

        stage('Build and Run Containers') {
            steps {
                sh 'docker --version'
                sh 'docker-compose up --build -d'
            }
        }

        stage('Stop Containers') {
            steps {
                sh 'docker-compose down'
            }
        }
    }
}
