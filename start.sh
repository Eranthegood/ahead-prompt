#!/bin/bash

# Script de démarrage pour l'application Thème de Couleur d'Interface

echo "🎨 Démarrage de l'application Thème de Couleur d'Interface..."
echo ""

# Vérifier si Python3 est disponible
if command -v python3 &> /dev/null; then
    echo "✅ Python3 détecté"
    echo "🚀 Démarrage du serveur sur http://localhost:8000"
    echo ""
    echo "Pour tester l'application :"
    echo "  1. Ouvrez http://localhost:8000 dans votre navigateur"
    echo "  2. Testez les différents thèmes"
    echo "  3. Essayez les conversions de couleur"
    echo ""
    echo "Pour arrêter le serveur : Ctrl+C"
    echo ""
    
    # Démarrer le serveur
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "✅ Python détecté"
    echo "🚀 Démarrage du serveur sur http://localhost:8000"
    echo ""
    python -m http.server 8000
    
else
    echo "❌ Python non trouvé"
    echo "Veuillez installer Python ou ouvrir index.html directement dans votre navigateur"
    echo ""
    echo "Alternative : Ouvrez index.html dans votre navigateur moderne"
fi