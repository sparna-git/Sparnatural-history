import { SparnaturalQueryIfc } from "sparnatural";
class LocalDataStorage {
  // Instance stores a reference to the Singleton
  private static instance: any;

  privateArray = new Array();

  constructor() {}

  get(name: any) {
    if (this.storageAvailable()) {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null; // Assurer que les objets JSON sont bien récupérés
    } else {
      return this.privateArray[name] || null;
    }
  }

  set(name: any, value: any) {
    if (this.storageAvailable()) {
      localStorage.setItem(name, JSON.stringify(value)); // Assurez-vous que les données sont stockées sous forme de JSON
    } else {
      this.privateArray[name] = value;
    }
  }

  // Get the Singleton instance if one exists
  // or create one if it doesn't
  static getInstance() {
    if (!LocalDataStorage.instance) {
      LocalDataStorage.instance = new LocalDataStorage();
    }

    return LocalDataStorage.instance;
  }

  saveQuery(queryJson: SparnaturalQueryIfc, lang: string = "fr"): void {
    if (!queryJson) {
      console.error("Impossible de sauvegarder une requête vide !");
      return;
    }

    // Ajoutez les métadonnées à la requête
    if (!queryJson.metadata) {
      queryJson.metadata = {};
    }
    queryJson.metadata.id = crypto.randomUUID();
    queryJson.metadata.date = new Date().toISOString();
    queryJson.metadata.isFavorite = false;

    // Ajoutez le résumé sous le nom `description` avec la langue comme clé
    if (!queryJson.metadata.description) {
      queryJson.metadata.description = {};
    }
    queryJson.metadata.description[lang] = "";

    let history = this.getHistory();
    console.log("Avant ajout :", history);

    // Vérifie si la requête existe déjà
    const existingQuery = history.find(
      (q: SparnaturalQueryIfc) =>
        JSON.stringify(q) === JSON.stringify(queryJson)
    );

    if (!existingQuery) {
      history.push(queryJson);
    }

    // Trie par date (plus récente en haut)
    history.sort(
      (a: SparnaturalQueryIfc, b: SparnaturalQueryIfc) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime()
    );

    // Si on dépasse 200, on supprime les plus anciennes non-favorites
    while (history.length > 200) {
      const oldestNonFavoriteIndex = history
        .map((entry, index) => ({ ...entry, index }))
        .reverse() // du plus ancien au plus récent
        .find((entry) => !entry.metadata.isFavorite)?.index;

      if (oldestNonFavoriteIndex !== undefined) {
        history.splice(oldestNonFavoriteIndex, 1);
      } else {
        // Si tous sont favoris, on ne supprime rien
        break;
      }
    }

    this.set("queryHistory", history);
    console.log("Après ajout :", this.getHistory());
  }

  getHistory(): SparnaturalQueryIfc[] {
    let history = localStorage.getItem("queryHistory");
    return history ? JSON.parse(history) : []; // Toujours un tableau
  }

  deleteQuery(id: string): void {
    let history = this.getHistory().filter(
      (entry: SparnaturalQueryIfc) => entry.metadata.id !== id
    );
    this.set("queryHistory", history);
  }

  clearHistory(): void {
    let history = this.getHistory().filter(
      (entry: SparnaturalQueryIfc) => entry.metadata.isFavorite
    );
    this.set("queryHistory", history);
  }
  private storageAvailable(): boolean {
    try {
      let storage = window.localStorage;
      let x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default LocalDataStorage;
