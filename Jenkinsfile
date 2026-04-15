pipeline {
    agent any
    stages {
        stage('Deploy with Compose') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }
}
