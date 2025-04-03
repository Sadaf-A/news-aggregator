pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/Sadaf-A/news-aggregator.git'
            }
        }

        stage('Build and Run Containers') {
            steps {
                sh '/usr/local/bin/docker-compose up --build -d'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'docker --version'
                sh '/usr/local/bin/docker-compose exec backend npm test'
            }
        }

        stage('Stop Containers') {
            steps {
                sh '/usr/local/bin/docker-compose down'
            }
        }
    }
}
