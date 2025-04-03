pipeline {
    agent any

    stages {
        stage('Check Docker Version') {
            steps {
                script {
                    sh 'docker --version'
                }
            }
        }
    }
}
