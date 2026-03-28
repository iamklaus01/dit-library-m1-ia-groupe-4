pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Récupération du code source de l\'app depuis Github...'
                checkout scm
            }
        }

        stage('Vérification') {
            steps {
                echo 'Check de la structure du projet...'
                sh '''
                    test -f docker-compose.yml && echo "docker-compose.yml OK"
                    test -d _books_service && echo "books-service OK"
                    test -d _users_service && echo "users-service OK"
                    test -d _book_loans_service && echo "loans-service OK"
                    test -d frontend && echo "frontend OK"
                '''
            }
        }

        stage('Build Docker images') {
            steps {
                echo 'Construction des images docker...'
                sh 'docker-compose build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Déploiement avec Docker compose...'
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }

    }

    post {
        success {
            echo 'Le déploiement est réussi !'
        }
        failure {
            echo 'Quelque chose n\'a pas marché. Vérifiez les logs.'
        }
    }
}