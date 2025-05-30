# DApp de Réservation d'Événements Web3

Ce projet est une application décentralisée (DApp) permettant de gérer des réservations pour des événements. La logique métier est gérée par un smart contract Ethereum, et l'interface utilisateur est construite avec React et interagit avec la blockchain via MetaMask.

## Contexte

L'objectif est de fournir un système de réservation transparent et sécurisé, sans dépendre d'une base de données centralisée classique. Les événements sont créés par le propriétaire du contrat, et les utilisateurs peuvent réserver des places tant qu'il y en a de disponibles et qu'ils n'ont pas déjà réservé.

## Technologies Utilisées

**Backend (Smart Contract) :**
*   **Solidity :** Langage de programmation pour les smart contracts Ethereum.
*   **Hardhat :** Environnement de développement Ethereum pour la compilation, le déploiement, les tests et le débogage des smart contracts.
*   **Ethers.js :** Utilisé dans les scripts Hardhat pour interagir avec le contrat.

**Frontend (Interface Utilisateur) :**
*   **React :** Bibliothèque JavaScript pour la construction d'interfaces utilisateur.
*   **Ethers.js (v6) :** Pour interagir avec le smart contract depuis le client.
*   **MetaMask :** Extension de navigateur servant de portefeuille Ethereum et permettant aux utilisateurs d'interagir avec la DApp.
*   **CSS :** Pour la mise en forme de l'interface.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

*   [Node.js](https://nodejs.org/) (version 16.x ou supérieure recommandée)
*   [npm](https://www.npmjs.com/) (généralement installé avec Node.js) ou [Yarn](https://yarnpkg.com/)
*   L'extension de navigateur [MetaMask](https://metamask.io/)

## Installation et Lancement

Suivez ces étapes pour installer et exécuter le projet localement :

1.  **Cloner le dépôt (si applicable) :**
    ```bash
    git clone https://github.com/01warrior/event-booking-app_with-blochain
    cd event-booking-dapp
    ```

2.  **Installer les dépendances du Backend :**
    ```bash
    cd backend
    npm install
    ```

3.  **Compiler le Smart Contract :**
    Toujours dans le dossier `backend` :
    ```bash
    npx hardhat compile
    ```
    Cela générera les artefacts du contrat (ABI et bytecode) dans `backend/artifacts/`.

4.  **Démarrer le Nœud Hardhat Local :**
    Ouvrez un **nouveau terminal** et naviguez jusqu'au dossier `backend`. Exécutez :
    ```bash
    npx hardhat node
    ```
    Gardez ce terminal ouvert. Il simule un réseau Ethereum local et affichera une liste de comptes de test et leurs clés privées.

5.  **Déployer le Smart Contract et Créer des Événements Initiaux :**
    Ouvrez un **autre terminal** et naviguez jusqu'au dossier `backend`. Exécutez le script de déploiement :
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    Notez bien l'adresse du contrat affichée (`EventBooking contract deployed to: 0x...`).

6.  **Configurer le Frontend :**
    *   Copiez l'adresse du contrat que vous venez de noter.
    *   Ouvrez le fichier `frontend/src/config_contrat.js` et mettez à jour la constante `EVENT_BOOKING_CONTRACT_ADDRESS` avec cette adresse.
    *   Assurez-vous que l'ABI du contrat est présent : copiez `backend/artifacts/contracts/EventBooking.sol/EventBooking.json` dans `frontend/src/contracts/EventBooking.json`. (Si vous suivez l'ordre, le script de déploiement génère cet ABI après la compilation).

7.  **Installer les dépendances du Frontend :**
    Naviguez vers le dossier `frontend` :
    ```bash
    cd ../frontend  # Si vous étiez dans backend
    # ou cd frontend # Si vous étiez à la racine
    npm install
    ```

8.  **Configurer MetaMask :**
    *   Ouvrez MetaMask dans votre navigateur.
    *   Ajoutez un nouveau réseau personnalisé si vous n'en disposez pas deja :
        *   **Nom du réseau :** Hardhat Local (ou un nom de votre choix)
        *   **Nouvelle URL RPC :** `http://127.0.0.1:8545`
        *   **ID de chaîne :** `31337`
        *   **Symbole de la devise :** ETH
    *   Importez au moins un ou deux comptes de test depuis ceux affichés par la console `npx hardhat node` (utilisez les clés privées). Le premier compte est celui qui a déployé le contrat et en est donc le propriétaire.

9.  **Lancer l'application React :**
    Toujours dans le dossier `frontend` :
    ```bash
    npm start
    ```
    Votre navigateur devrait s'ouvrir automatiquement sur `http://localhost:3000` (ou un port similaire) et afficher l'application.

## Utilisation

1.  Sur la page de la DApp, cliquez sur "Connect MetaMask" et approuvez la connexion dans la pop-up MetaMask.
2.  Une fois connecté, la liste des événements disponibles devrait s'afficher.
3.  Pour chaque événement, vous verrez son nom, sa capacité totale, le nombre de places déjà réservées et le nombre de places restantes.
4.  Cliquez sur "Reserve Place" pour un événement. MetaMask vous demandera de confirmer la transaction.
5.  Après confirmation, la page se mettra à jour pour refléter votre réservation.
    *   Le bouton sera désactivé si vous avez déjà réservé ou si l'événement est complet.
    *   Des messages de succès ou d'erreur s'afficheront.