import { HTMLComponent } from "sparnatural";
import { ISparnaturalSpecification } from "sparnatural";
import HistorySection from "./HistorySection";
import "datatables.net";
import { SparnaturalHistoryElement } from "../../SparnaturalHistoryElement";
import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n";
import { getSettings } from "../settings/defaultSettings";

class SparnaturalHistoryComponent extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  historySection: HistorySection;

  constructor() {
    super("SparnaturalHistory", null, null);
    console.log("SparnaturalHistoryComponent constructed");
  }

  render(): this {
    this.#initLang();
    console.log("Rendering SparnaturalHistoryComponent...");

    this.historySection = new HistorySection(this).render();

    return this;
  }

  /**
   * Sets the specification provider and initializes the history section.
   * Should be called externally (e.g., in plugin binding code).
   */
  public setSpecProvider(sp: ISparnaturalSpecification): void {
    this.specProvider = sp;
    console.log("SparnaturalHistoryComponent: specProvider", sp);

    this.historySection.setSpecProvider(sp);

    // Dispatch INIT event to signal other components
    this.html[0].dispatchEvent(
      new CustomEvent(SparnaturalHistoryElement.EVENT_INIT, {
        bubbles: true,
        detail: { sparnaturalHistory: this },
      })
    );
  }

  #initLang() {
    const lang = getSettings().language;
    if (lang === "fr") {
      SparnaturalHistoryI18n.init("fr");
    } else {
      SparnaturalHistoryI18n.init("en");
    }
  }
}

export default SparnaturalHistoryComponent;
