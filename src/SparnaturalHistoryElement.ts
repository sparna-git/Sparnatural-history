import "../scss/sparnatural-history.scss";
import SparnaturalHistoryComponent from "./sparnatural-history/component/SparnaturalHistoryComponent";
import { SparnaturalQueryIfc } from "sparnatural";
// import QueryLoader from "./sparnatural/querypreloading/QueryLoader";
// import SparnaturalComponent from "./sparnatural/components/SparnaturalComponent";
import { SparnaturalHistoryAttributes } from "./SparnaturalHistoryAttributes";
import {
  getSettings,
  mergeSettings,
} from "./sparnatural-history/settings/defaultSettings";
import LocalDataStorage from "./sparnatural-history/storage/LocalDataStorage";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";

export class SparnaturalHistoryElement extends HTMLElement {
  static HTML_ELEMENT_NAME = "sparnatural-history";
  static EVENT_INIT = "init";
  static EVENT_LOAD_QUERY = "loadQuery";

  // just to avoid name clash with "attributes"
  _attributes: SparnaturalHistoryAttributes;

  private lastQueryJson: SparnaturalQueryIfc = null;

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

  static get observedAttributes() {
    return ["lang"];
  }
  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    // prevents callback to be called on initial creation
    if (oldValue != null) {
      switch (name) {
        case "lang": {
          getSettings().language = newValue;
          break;
        }
        default: {
          throw new Error("unknown observed attribute ${name}");
        }
      }

      // then display/reprint
      this.display();
    }
  }

  notifyConfiguration(config: any): void {
    this.sparnaturalHistory.setSpecProvider(config);
  }

  triggerLoadQueryEvent(query: SparnaturalQueryIfc) {
    // Dispatch LOAD_QUERY event
    this.dispatchEvent(
      new CustomEvent(SparnaturalHistoryElement.EVENT_LOAD_QUERY, {
        bubbles: true,
        detail: { query: query },
      })
    );
  }

  // Méthode pour sauvegarder la requête dans le local storage
  saveQuery(queryJson: SparnaturalQueryIfc): void {
    if (!queryJson) {
      console.error("Impossible de sauvegarder une requête vide !");
      return;
    }

    const storage = LocalDataStorage.getInstance();

    // Vérifier si la requête existe déjà dans l'historique
    const alreadyExists = storage
      .getHistory()
      .some(
        (q: SparnaturalQueryIfc) =>
          JSON.stringify(q) === JSON.stringify(queryJson)
      );

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
