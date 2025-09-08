## TODO

### Général

- [x] Tester avec 2+ équipes : vérifier que l'on voit la position des autres équipes et qu'on reçoit la leur quand on envoi notre position.

### Team (Application)

- [x] Rendre plus claire le code de capture dans l'interface utilisateur (bien préciser que c'est l'id de capture).
- [x] Ajouter timer du rétrécissement des zones.
- [x] Afficher dernière position envoyée par la team.
- [x] Rendre la position de l'ennemi visible dès le départ.
- [x] Préciser que l'équipe doit fournir une photo d'eux où l'on voit leur tête et au moins leur buste.
- [x] Utiliser les messages de victoire/défaite/etc définis par le serveur.
- [x] Centrer la map sur la position à l'ouverture + bouton centrage
- [x] Indiquer que l'équipe est hors zone.
- [x] Mettre les stats dans le tiroir (distance, temps, vitesse moy, nb captures, nb envoi)
- [ ] Implémenter des notifs lors du background (hors zone, position envoyée, update zone)
- [ ] Ajouter les logs de la partie
- [ ] Créer le menu paramètre (idées de section : langue, photo équipe, notifs, mode sombre, unitées)
- [ ] Afficher la trajectoire passée sur la carte (désactivable)
- [ ] Afficher les évènements passés sur la carte (captures, envois, départ) (désactivable)
- [ ] Permettre le changement du style de la carte (schéma, satellite, relief etc)
- [ ] Ajouter imprécision de la position au besoin (comme sur google maps)
- [ ] Synchroniser les horloges sur l'interface
- [ ] Avoir un récap des évènement de la partie
- [ ] Publier sur le playstore

### Admin (Pageweb)

- [x] Clarifier qui est qui sur l'interface.
- [x] Clarifier qui chasse qui sur l'interface.
- [x] Ajouter timer du rétrécissement des zones.
- [x] Pouvoir changer les paramètres du jeu pendant une partie.
- [x] Implémenter les wireframes
- [x] Ajouter une région par défaut si pas de position
- [x] Focus une team cliquée
- [x] Refaire les flèches de chasse sur la map
- [x] Pouvoir définir la zone de départ de chaque équipe
- [x] Nommer les polygons par des lettres de l'alphabet
- [ ] Plein écran
- [ ] Pouvoir faire pause dans la partie
- [ ] Mettre en évidence le menu paramètre
- [ ] Afficher un feedback quand un paramètre est sauvegardé
- [ ] Améliorer le système de création zone (cercle et polygone)
- [ ] Voir les traces et évènements des teams
- [ ] Voir l'incertitude de position des teams
- [ ] Faire un menu quand on arrive sur la traque
- [ ] Pouvoir load des paramètres enregistrés
- [ ] Penser l'affichage en fin de traque

### Améliorations du jeu de la traque

- [x] Supprimer la pénalité de non envoi de position : envoyer la position automatiquement à la fin du timer.
- [x] Supprimer la pénalité d'hors zone : révéler la position de la team hors zone au bout d'un certain temps.
- [x] Changer le système de zone de jeu pour qu'il soit fait d'un pavage de zones qui se ferment successivement.

### Autres idées

- Améliorer l'accessibilité du site et de l'appli (traduction anglaise notamment).
- Nettoyer le code, le commenter, créer des tests, le rendre maintenable après la fin du projet.
- Améliorer l'UI admin.
- Améliorer l'UI team.
