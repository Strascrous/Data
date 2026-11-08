# Strascrous Data

Données des villes partagées entre l’application Flutter et l’API Strascrous. Ce dépôt génère deux bibliothèques depuis un fichier YAML : **`@strascrous/data`** pour TypeScript et **`strascrous_data`** pour Flutter.

## Prérequis
- Node.js 24+ recommandé
- [Flutter](https://docs.flutter.dev/get-started/install)

## Installation et génération
```sh
npm ci
npm run generate
```

Les bibliothèques sont générées dans `dist/ts/` et `dist/dart/`.

## Utilisation
### TypeScript
Installer la bibliothèque :
```sh
npm install 'git+https://github.com/Strascrous/Data.git#generated/ts'
```

```ts
import { cities, findCityById } from '@strascrous/data';

console.log(cities);
console.log(findCityById('strasbourg')?.areas);
```

### Flutter
Ajouter la dépendance dans `pubspec.yaml` :
```yaml
dependencies:
    strascrous_data:
        git:
            url: https://github.com/Strascrous/Data.git
            ref: generated/dart
```

Puis lancer `flutter pub get` et importer la bibliothèque :
```dart
import 'package:strascrous_data/strascrous_data.dart';

final city = cities.firstWhere((city) => city.id == 'strasbourg');
```

## Développement
Les villes sont définies dans [`data/cities.yaml`](data/cities.yaml), regroupées par académie. Les données sont validées à la génération par le [schéma](schema/cities.schema.json).

Il existe deux sources pour les icônes:
- [Material](https://fonts.google.com/icons): correspondant à `material` dans les données
- [Material Design Icons](https://pictogrammers.com/library/mdi/): correspondant à `mdi` dans les données

### Vérifier les bibliothèques générées
Après génération :
```sh
# TypeScript
(cd dist/ts && npm ci && npm run build)

# Flutter
(cd dist/dart && flutter pub get && flutter analyze)
```

## Distribution
La publication d’une release GitHub déclenche la génération, les vérifications et la distribution sur les branches `generated/ts` et `generated/dart`.

## Organisation du projet
```text
data/                        # Villes par académie
schema/                      # Schéma de validation
scripts/                     # Génération et versionnement
templates/
├── dart/                    # Modèle Flutter
└── ts/                      # Modèle TypeScript
dist/                        # Bibliothèques générées
.github/workflows/           # Distribution automatique
```

## Licence
Ce projet est sous [licence MIT](LICENSE).

Les icônes Material Design Icons sont sous **licence Apache 2.0**, incluse dans la bibliothèque Flutter générée.
