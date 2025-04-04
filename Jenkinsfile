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
                    sleep 7
                    sh 'docker ps'
                }
            }
        }
        stage('Deploy Backend to GCP') {
            steps {
                script {
                    sleep 13
                    sh 'docker ps'
                }
            }
        }
    }

    post {
        always {
            discordSend(
                description: "Build ${currentBuild.currentResult}: Job '${env.JOB_NAME}' [${env.BUILD_NUMBER}]",
                link: env.BUILD_URL,
                result: currentBuild.currentResult,
                webhookURL: 'https://discord.com/api/webhooks/1357634569179758634/of4MBQzYZjqQpJvkrAILFeWG8aGyzM8aIVqL600Cqw-VcfxxBMUOagT4uuppn98CpQGc'
            )
        }
    }
}
