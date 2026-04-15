pipeline {
    agent any
    stages {
        stage('Deploy with Compose') {
            steps {
                // Starts services defined in docker-compose.yml
                sh 'docker compose up -d'
            }
        }
    }
}
