import "./assets/stylesheets/sparnatural-history.scss";
import SparnaturalHistoryComponent from "./sparnatural-history/component/SparnaturalHistoryComponent";
import { ISparJson } from "sparnatural/src/sparnatural/generators/json/ISparJson";
// import QueryLoader from "./sparnatural/querypreloading/QueryLoader";
// import SparnaturalComponent from "./sparnatural/components/SparnaturalComponent";
import { SparnaturalHistoryAttributes } from "./SparnaturalHistoryAttributes";
import { mergeSettings } from "./sparnatural-history/settings/defaultSettings";
import LocalDataStorage from "./sparnatural-history/storage/LocalDataStorage";

export class SparnaturalHistoryElement extends HTMLElement {
  static HTML_ELEMENT_NAME = "sparnatural-history";
  static EVENT_INIT = "init";
  static EVENT_LOAD_QUERY = "loadQuery";

  // just to avoid name clash with "attributes"
  _attributes: SparnaturalHistoryAttributes;

  private lastQueryJson: ISparJson = null;

  sparnaturalHistory: SparnaturalHistoryComponent;
  // sparnatural: SparnaturalComponent;

  constructor() {
    super();
    console.log("SparnaturalHistoryElement constructed");
  }

  connectedCallback() {
    console.log("SparnaturalHistoryElement connected to the DOM");
    this.display();
  }

  display() {
    console.log("Displaying SparnaturalHistoryComponent...");
    this.sparnaturalHistory = new SparnaturalHistoryComponent();
    $(this).empty();
    $(this).append(this.sparnaturalHistory.html);
    this._attributes = new SparnaturalHistoryAttributes(this);
    mergeSettings(this._attributes);
    this.sparnaturalHistory.render();
  }

  triggerLoadQueryEvent(query: ISparJson) {
    // Dispatch LOAD_QUERY event
    this.dispatchEvent(
      new CustomEvent(SparnaturalHistoryElement.EVENT_LOAD_QUERY, {
        bubbles: true,
        detail: { query: query },
      })
    );
  }

  // Méthode pour sauvegarder la requête dans le local storage
  saveQuery(queryJson: ISparJson): void {
    if (!queryJson) {
      console.error("Impossible de sauvegarder une requête vide !");
      return;
    }

    const storage = LocalDataStorage.getInstance();

    // Vérifier si la requête existe déjà dans l'historique
    const alreadyExists = storage
      .getHistory()
      .some((q: ISparJson) => JSON.stringify(q) === JSON.stringify(queryJson));

    if (!alreadyExists) {
      storage.saveQuery(queryJson);
      console.info("Requête sauvegardée avec succès.");
    } else {
      console.info("Requête déjà présente dans l'historique.");
    }
  }

  // Méthode publique pour ouvrir le modal d’historique depuis l’extérieur
  public openHistoryModal(): void {
    if (this.sparnaturalHistory?.historySection) {
      this.sparnaturalHistory.historySection.showHistory();
    } else {
      console.error("HistorySection is not initialized yet.");
    }
  }
}
customElements.get(SparnaturalHistoryElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(
    SparnaturalHistoryElement.HTML_ELEMENT_NAME,
    SparnaturalHistoryElement
  );

/*
    if (!this.sparnatural) {
      console.error(
        "Erreur: SparnaturalComponent n'est pas encore initialisé !"
      );
      // Vérifier si un élément <spar-natural> est présent dans le DOM
      const sparnaturalElement = document.querySelector("spar-natural") as any;
      if (sparnaturalElement && sparnaturalElement.sparnatural) {
        this.sparnatural = sparnaturalElement.sparnatural;
      } else {
        console.error("Impossible de récupérer SparnaturalComponent !");
        return;
      }
    }
    QueryLoader.setSparnatural(this.sparnatural);
    QueryLoader.loadQuery(query);
    */
