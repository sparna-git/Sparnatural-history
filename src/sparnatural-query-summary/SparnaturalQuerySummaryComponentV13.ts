import "./assets/stylesheets/theme.scss";
import "./assets/stylesheets/query-summary.scss";

import { HTMLComponent } from "sparnatural";
import {
  SparnaturalQuery,
  PatternBgpSameSubject,
  PredicateObjectPair,
  ObjectCriteria,
  TermTypedVariable,
  ISparnaturalSpecification,
} from "sparnatural";

import { SparnaturalQuerySummaryI18n } from "./SparnaturalQuerySummaryI18n";

export class SparnaturalQuerySummaryComponentV13 extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  queryJson: SparnaturalQuery;
  language: string;
  querySummary: string;
  variableDisplayed: string[] = [];

  static ICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"
    class="feather feather-eye">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
  </svg>`;

  constructor(
    specProvider: ISparnaturalSpecification,
    queryJson: SparnaturalQuery,
    language: string,
  ) {
    super("SparnaturalQuerySummaryComponent", null, null);
    this.specProvider = specProvider;
    this.queryJson = queryJson;
    this.language = language;
    this.render();
  }

  render(): this {
    this.#initLang();
    this.variableDisplayed = [];

    this.querySummary = this.formatQuerySummary(this.queryJson);
    this.addPaddings();

    return this;
  }

  #initLang() {
    SparnaturalQuerySummaryI18n.init(this.language === "fr" ? "fr" : "en");
  }

  private formatQuerySummary(query: SparnaturalQuery): string {
    const variables = query.variables
      .filter((v) => v.type === "term" && v.subType === "variable")
      .map((v: any) => v.value);

    return `
      <div class="SparnturalQuerySummaryComponent query-summary SparnaturalTheme">
        ${this.formatBgp(query.where, variables, true)}
      </div>
    `;
  }

  private formatBgp(
    bgp: PatternBgpSameSubject,
    variables: string[],
    isRoot: boolean,
  ): string {
    if (!bgp.predicateObjectPairs.length) return "";

    let html = `<ul>`;
    let nbChildren = 0;

    bgp.predicateObjectPairs.forEach((pair) => {
      nbChildren++;
      html += this.formatPredicateObjectPair(
        bgp.subject,
        pair,
        variables,
        isRoot,
        nbChildren,
      );
    });

    html += `</ul>`;
    return html;
  }

  private formatPredicateObjectPair(
    subject: TermTypedVariable,
    pair: PredicateObjectPair,
    variables: string[],
    isRoot: boolean,
    nbChildren: number,
  ): string {
    let startLogic = "";
    let endLogic = "";
    let sSelceted = "";
    let oSelceted = "";
    let whereStartLabel = "";
    let displaystartLabel = "";

    /* ===== variable selection ===== */

    if (variables.includes(subject.value) && isRoot) {
      if (!this.variableDisplayed.includes(subject.value)) {
        this.variableDisplayed.push(subject.value);
        sSelceted = SparnaturalQuerySummaryComponentV13.ICON_EYE;
      }
    }

    if (variables.includes(pair.object.variable.value)) {
      if (!this.variableDisplayed.includes(pair.object.variable.value)) {
        this.variableDisplayed.push(pair.object.variable.value);
        oSelceted = SparnaturalQuerySummaryComponentV13.ICON_EYE;
      }
    }

    /* ===== labels ===== */

    const startLabel =
      this.specProvider?.getEntity(subject.rdfType)?.getLabel() ??
      this.extractLastSegment(subject.rdfType);

    const propLabel =
      this.specProvider?.getProperty(pair.predicate.value)?.getLabel() ??
      this.extractLastSegment(pair.predicate.value);

    const endLabel =
      this.specProvider?.getEntity(pair.object.variable.rdfType)?.getLabel() ??
      this.extractLastSegment(pair.object.variable.rdfType);

    /* ===== options ===== */

    let startOption = "";
    if (pair.subType === "optional") {
      startOption += `<span class='startOption optional'>${SparnaturalQuerySummaryI18n.labels.optionnal}</span> `;
    }
    if (pair.subType === "notExists") {
      startOption += `<span class='startOption notExist'>${SparnaturalQuerySummaryI18n.labels.notexist}</span> `;
    }

    if (!isRoot || nbChildren > 1) {
      displaystartLabel = "grayStartLabel";
    }

    /* ===== selected values ===== */

    const selectedValues = this.formatObjectValues(pair.object);

    if (nbChildren === 1) {
      whereStartLabel = `${startOption} <strong class="sumSujet ${displaystartLabel}">${startLabel}${sSelceted}</strong> `;
    } else {
      whereStartLabel = `<strong class="sumSujet ${displaystartLabel}">${startLabel}${sSelceted}</strong>${startOption} `;
    }

    let htmlLI = "";
    if (isRoot && nbChildren === 1) {
      htmlLI = `<li><div class="line">${startLogic}${startOption}<strong class="sumSujet">${startLabel}${sSelceted}</strong> <span class="sumPredicat">${propLabel}</span> <strong class="sumObjet">${endLabel}${oSelceted}</strong>${endLogic}${selectedValues}</div>`;
    } else {
      htmlLI = `<li><div class="line">${startLogic} ${whereStartLabel} <span class="sumPredicat">${propLabel}</span> <strong class="sumObjet">${endLabel}${oSelceted}</strong>${selectedValues}${endLogic}</div>`;
    }

    /* ===== nested BGP ===== */

    if (pair.object.predicateObjectPairs?.length) {
      htmlLI += this.formatBgp(
        {
          type: "pattern",
          subType: "bgpSameSubject",
          subject: pair.object.variable,
          predicateObjectPairs: pair.object.predicateObjectPairs,
        },
        variables,
        false,
      );
      htmlLI += `</li>`;
    }

    return htmlLI;
  }

  private formatObjectValues(object: ObjectCriteria): string {
    const values: string[] = [];

    object.values?.forEach((entry: any) => {
      // CAS 1 : entry est DIRECTEMENT un Term
      if (entry?.type === "term" && entry.value) {
        if (entry.label) {
          values.push(entry.label);
        } else {
          const fromSpec = this.specProvider
            ?.getEntity(entry.value)
            ?.getLabel();
          values.push(fromSpec ?? this.extractLastSegment(entry.value));
        }
        return;
      }

      // CAS 2 : entry est un ValuePatternRow (spec théorique)
      if (typeof entry === "object") {
        Object.values(entry).forEach((term: any) => {
          if (!term || !term.value) return;

          if (term.label) {
            values.push(term.label);
            return;
          }

          const fromSpec = this.specProvider?.getEntity(term.value)?.getLabel();

          values.push(fromSpec ?? this.extractLastSegment(term.value));
        });
      }
    });

    // filters (inchangé)
    object.filters?.forEach((f) => {
      if (f.label) values.push(f.label);
    });

    // EXACTEMENT comme l’ancienne version
    if (values.length === 0) {
      if (!object.predicateObjectPairs?.length) {
        return `
        <div class="selectedValues">
          <span class="selectedValue">
            ${SparnaturalQuerySummaryI18n.labels.any}
          </span>
        </div>
      `;
      }
      return "";
    }

    const label =
      values.length > 1
        ? `${SparnaturalQuerySummaryI18n.labels.values} : `
        : "";

    return `
    <div class="selectedValues">
      ${label}${values
      .map((v) => `<span class="selectedValue">${v}</span>`)
      .join(", ")}
    </div>
  `;
  }

  private extractLastSegment = (uri: string): string =>
    uri ? uri.substring(uri.lastIndexOf("/") + 1) : "Inconnu";

  private addPaddings() {
    // create the temporary Element

    const ruler = document.createElement("div");
    ruler.style.width = "auto";
    ruler.style.position = "absolute";
    ruler.style.whiteSpace = "nowrap";
    // Adding the element as a child to myElement.

    // it will be added to the DOM
    ruler.innerHTML = this.querySummary;
    document.body.appendChild(ruler);
    let uls = ruler.querySelectorAll("ul");
    uls.forEach((ul: any) => {
      if (ul.parentElement?.tagName === "LI") {
        //ul.parentElement.style.color = "red";
        let sumSujets = ul.querySelectorAll(".sumSujet");
        if (sumSujets.length) {
          ul.style.marginLeft = sumSujets[0].offsetWidth + "px";
        }
      }
    });

    this.querySummary = ruler.innerHTML;
    document.body.removeChild(ruler);
  }
}
