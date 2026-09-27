# Authentification et Sécurité des Identifiants

## 1. Principes Fondamentaux de Sécurité

1. **Aucun Secret Côté Client** : Le frontend (React / PWA) ne possède ni clé d'API, ni identifiant client, ni token de session.
2. **Variables d'Environnement Serveur** : Les identifiants sont renseignés dans le fichier `.env` sur le serveur d'exécution et lus exclusivement par le backend Node.js / Express.
3. **Assainissement des Journaux** : Le logger structuré filtre systématiquement les champs sensibles (`secret`, `password`, `key`, `authorization`, `token`, `bearer`).
4. **Protection SSRF** : Les URLs cibles de requêtes sont strictement restreintes aux domaines officiels Copernicus (liste blanche de domaines).

## 2. Configuration des Identifiants

Dans votre fichier `.env` :

```env
# Copernicus Data Space Ecosystem (CDSE)
COPERNICUS_CLIENT_ID=votre_client_id_cdse
COPERNICUS_CLIENT_SECRET=votre_client_secret_cdse

# Climate Data Store (CDS / ERA5)
CDS_API_KEY=votre_cle_cds

# Atmosphere Data Store (ADS / CAMS)
ADS_API_KEY=votre_cle_ads

# Copernicus Marine Service
MARINE_USERNAME=votre_utilisateur
MARINE_PASSWORD=votre_mot_de_passe

# CARTO Basemaps (carto.com)
CARTO_API_KEY=cb1_401f_1_81e88d5ab80e13c7924b8b1d
VITE_CARTO_API_KEY=cb1_401f_1_81e88d5ab80e13c7924b8b1d

# Gemini AI (Analyste Environnemental)
GEMINI_API_KEY=votre_cle_gemini
```

Si aucune clé n'est renseignée, l'application démarre automatiquement en **Mode Démonstration Scientifique** sans générer d'erreurs bloquantes.
