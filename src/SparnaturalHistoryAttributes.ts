export class SparnaturalHistoryAttributes {
  language: string;
  // add url for for mistral api this attribute will be optional and used for redering the button of generate
  // if this url don't exist hide the button generate
  urlAPI?: string;

  constructor(element: HTMLElement) {
    this.language = this.#read(element, "lang");
    this.urlAPI = this.#read(element, "urlAPI");
  }

  #read(element: HTMLElement, attribute: string, asJson: boolean = false) {
    return element.getAttribute(attribute)
      ? asJson
        ? JSON.parse(element.getAttribute(attribute))
        : element.getAttribute(attribute)
      : undefined;
  }
}
