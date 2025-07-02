import SparnaturalServicesComponent from "./components/SparnaturalServicesComponent";
import { SparnaturalServicesAttributes } from "./SparnaturalServicesAttributes";

export class SparnaturalServicesElement extends HTMLElement {
  static HTML_ELEMENT_NAME = "services";

  _attributes: SparnaturalServicesAttributes;
  sparnaturalServices: SparnaturalServicesComponent;

  constructor() {
    super();
    console.log("SparnaturalServicesElement constructed");
  }

  connectedCallback() {
    console.log("SparnaturalServicesElement connected to the DOM");
    this.display();
  }

  display() {
    console.log("Displaying SparnaturalServicesComponent...");
    this.sparnaturalServices = new SparnaturalServicesComponent();
    $(this).empty();
    $(this).append(this.sparnaturalServices.html);
    this._attributes = new SparnaturalServicesAttributes(this);

    // Tu peux ici faire un fetch ou autre avec this._attributes.href
    if (this._attributes.href) {
      console.log("Fetching services from:", this._attributes.href);
      // Exemple :
      fetch(this._attributes.href)
        .then((res) => res.json())
        .then((data) => {
          console.log("Received services data:", data);
          // Intégrer dans le composant si nécessaire
        })
        .catch((err) => console.error("Error loading services:", err));
    }

    this.sparnaturalServices.render();
  }

  static get observedAttributes() {
    return ["href"];
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) return;
    if (oldValue != null) {
      this.display();
    }
  }
}

customElements.get(SparnaturalServicesElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(
    SparnaturalServicesElement.HTML_ELEMENT_NAME,
    SparnaturalServicesElement
  );
