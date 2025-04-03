pipeline {
    agent {
        docker {
            image 'docker:latest'
            args '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
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
