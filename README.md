# Daily Planner Frontend

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/OpenWeatherMap-fff?style=for-the-badge&logo=openweathermap&logoColor=orange" alt="OpenWeatherMap">
</div>

## Description

Une application web responsive pour organiser efficacement sa journée : tâches, objectifs, météo et emploi du temps, le tout dans une interface moderne et esthétique.

## Objectif du projet

Ce projet a pour but de créer une application web qui permet à l'utilisateur de :

- Planifier sa journée heure par heure (de 06:00 à 21:00)
- Noter ses tâches, objectifs, et notes
- Consulter la météo du jour
- Visualiser un planning clair et esthétique pour rester productif

## Architecture technique

### Technologies utilisées

- **HTML5** - Structure sémantique de l'application
- **CSS3** - Styles et design responsive
- **JavaScript** - Logique fonctionnelle côté client
- **OpenWeatherMap API** - Données météorologiques

### Structure des fichiers

```
/daily-planner/
│
├── index.html          # Structure HTML principale
├── style.css           # Feuille de styles pour le design
├── script.js           # Logique fonctionnelle (JavaScript)
└── assets/             # Images, icônes météo, illustrations
    ├── icons/
    └── images/
```

## Diagrammes d'architecture

### Diagramme de cas d'utilisation
<img width="1227" height="215" alt="Diagramme de cas d'utilisation" src="https://github.com/user-attachments/assets/c0301eb6-d90d-4ac9-8ac1-c9876f5b3b57" />

### Diagramme de classes
<img width="945" height="289" alt="Diagramme de classes" src="https://github.com/user-attachments/assets/e96b0a8b-0c56-4fb2-8889-4f7969243e6d" />

## Installation

### Prérequis

- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- VS Code avec l'extension Live Server (recommandé)

### Installation locale

```bash
# Cloner le projet
git clone https://github.com/Yan739/daily-planner.git

# Accéder au dossier
cd daily-planner

# Ouvrir dans VS Code
code .
```

Ensuite, utilisez Live Server pour lancer l'application (voir section "Développement" ci-dessous).

## Configuration

### Variables d'environnement

Pour utiliser l'API météo, vous devez :

1. Créer un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Obtenir une clé API gratuite
3. Remplacer `YOUR_API_KEY` dans le fichier `script.js`

```javascript
const WEATHER_API_KEY = 'YOUR_API_KEY';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
```

## Fonctionnalités

### Actuelles
- Interface utilisateur responsive
- Planning horaire de 06:00 à 21:00
- Gestion des tâches et objectifs
- Prise de notes
- Affichage de la météo

### À venir
- Sauvegarde automatique via LocalStorage
- Intégration complète de l'API météo (OpenWeatherMap)
- Thème clair/sombre
- Vue hebdomadaire avec navigation par jour
- Notifications et rappels
- Export des données en PDF
- Synchronisation avec le backend API

## Utilisation

1. **Ouvrir l'application** dans votre navigateur
2. **Planifier votre journée** en ajoutant des créneaux horaires
3. **Ajouter des tâches** et objectifs pour la journée
4. **Consulter la météo** pour adapter vos activités
5. **Prendre des notes** au fur et à mesure

## Développement

Pour développer et tester l'application, utilisez l'extension **Live Server** de VS Code :

1. Ouvrir le projet dans VS Code
2. Clic droit sur `index.html`
3. Sélectionner "Open with Live Server"
4. L'application s'ouvrira automatiquement dans votre navigateur avec rechargement automatique

## Compatibilité

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile : iOS Safari, Chrome Mobile

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Auteur

**Yann NGATEU**

Projet réalisé dans le cadre d'un projet personnel.

## Liens utiles

- [OpenWeatherMap API](https://openweathermap.org/api)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/) - Compatibilité des fonctionnalités web

---

<div align="center">
  Fait avec ❤️ par Yann NGATEU
</div>
