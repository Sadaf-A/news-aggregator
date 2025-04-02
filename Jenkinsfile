pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/Sadaf-A/news-aggregator.git'
            }
        }

        stage('Install Docker Compose') {
            steps {
                sh '''
                curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                chmod +x /usr/local/bin/docker-compose
                docker-compose --version
                '''
            }
        }

        stage('Build and Run Containers') {
            steps {
                sh 'docker-compose up --build -d'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'docker-compose exec backend npm test'
            }
        }

        stage('Stop Containers') {
            steps {
                sh 'docker-compose down'
            }
        }
    }
}
