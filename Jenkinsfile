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

        stage('Install Node.js') {
            steps {
                script {
                    sh 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash'
                    sh '. ~/.nvm/nvm.sh' 
                    sh 'nvm install 18' 
                    sh 'nvm use 18' 
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                script {
                    dir('news-aggregator-backend') { 
                        sh 'npm install' 
                        sh 'npm test'           
                    }
                }
            }
        }
    }
}
