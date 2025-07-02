// attributes for Sparnatural services

export class SparnaturalServicesAttributes {
  href: string;

  constructor(element: HTMLElement) {
    this.href = this.#read(element, "href");
  }

  #read(element: HTMLElement, attribute: string, asJson: boolean = false) {
    return element.getAttribute(attribute)
      ? asJson
        ? JSON.parse(element.getAttribute(attribute))
        : element.getAttribute(attribute)
      : undefined;
  }
}
