import SparnaturalServicesComponent from "./components/SparnaturalServicesComponent";
import { SparnaturalServicesAttributes } from "./SparnaturalServicesAttributes";
import $ from "jquery";

export class SparnaturalServicesElement extends HTMLElement {
  static HTML_ELEMENT_NAME = "sparnatural-services";

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
    this._attributes = new SparnaturalServicesAttributes(this);

    this.sparnaturalServices = new SparnaturalServicesComponent();

    $(this).empty();
    $(this).append(this.sparnaturalServices.html);
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
    this.display();
  }
}

customElements.get(SparnaturalServicesElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(
    SparnaturalServicesElement.HTML_ELEMENT_NAME,
    SparnaturalServicesElement
  );
