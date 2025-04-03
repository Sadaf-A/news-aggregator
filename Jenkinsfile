pipeline {
    agent any
    stages {
        stage('Docker Compose Up') {
            steps {
                dockerCompose(up: '--build -d')
            }
        }
        stage('Docker Compose Down') {
            steps {
                dockerCompose(down: true)
            }
        }
    }
}