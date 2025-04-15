import "./assets/stylesheets/theme.scss";
import "./assets/stylesheets/query-summary.scss";

import HTMLComponent from "sparnatural/src/sparnatural/components/HtmlComponent";
import { Branch, ISparJson, VariableExpression, VariableTerm } from "sparnatural/src/sparnatural/generators/json/ISparJson";
import ISparnaturalSpecification from "sparnatural/src/sparnatural/spec-providers/ISparnaturalSpecification";
import { SparnaturalQuerySummaryI18n } from "./SparnaturalQuerySummaryI18n";


export class SparnaturalQuerySummaryComponent extends HTMLComponent {

    specProvider: ISparnaturalSpecification;
    queryJson: ISparJson;
    language: string;
    querySummary: string;

    newQuerySummary: string;

    static ICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  
    constructor( specProvider: ISparnaturalSpecification, queryJson: ISparJson, language: string) {
      super("SparnaturalQuerySummaryComponent", null, null);
      this.specProvider = specProvider;
      this.queryJson = queryJson;
      this.language = language;
      console.log("SparnaturalQuerySummaryComponent constructed");
      this.render();
    }

    render(): this {
        this.#initLang();
        console.log(this.queryJson) ;
        console.log("Rendering SparnaturalQuerySummaryComponent...");

        this.querySummary = this.formatQuerySummary(this.queryJson, this.specProvider);

        console.log(this.newQuerySummary);

        return this;
    }

    #initLang() {
        const lang = this.language;
        if (lang === "fr") {
            SparnaturalQuerySummaryI18n.init("fr");
        } else {
            SparnaturalQuerySummaryI18n.init("en");
        }
    }

    private formatChildsItems(childrens: any, variables: any, isRoot: boolean = true): string {
        let htmlUL:string = "";
        if (childrens.length > 0) {
            htmlUL += `<ul>`;
            let nbChildren = 0 ;
            childrens.forEach((branch: any) => {
                let startLogic = "" ;
                nbChildren++ ;  
                let sSelceted = "" ;
                let oSelceted = "" ;
                if (variables.includes(branch.line.s)) {
                    sSelceted = SparnaturalQuerySummaryComponent.ICON_EYE ;
                }
                if (variables.includes(branch.line.o)) {
                    oSelceted = SparnaturalQuerySummaryComponent.ICON_EYE ;
                }
                const startLabel =
                    branch.line.sType &&
                    (this.specProvider?.getEntity(branch.line.sType)?.getLabel()||
                    this.extractLastSegment(branch.line.sType));
                const propLabel =
                    branch.line.p &&
                    (this.specProvider?.getProperty(branch.line.p)?.getLabel() ||
                    this.extractLastSegment(branch.line.p));
            
                const endLabel =
                    branch.line.oType &&
                    (this.specProvider?.getEntity(branch.line.oType)?.getLabel() ||
                    this.extractLastSegment(branch.line.oType));
                let startOption = "" ;  
                if (branch?.optional === true) {
                    startOption += "<span class='startOtion optional'>Optional</span>";
                }
                if (branch?.notExist === true) {
                    startOption += "<span class='startOtion notExist'>Not exist</span>";
                }

                if (nbChildren > 1) {
                    if (isRoot) {
                        startLogic = "<span class='logic And'>AND</span>";
                    } else {
                        startLogic = "<span class='logic And'>And</span>";
                    }
                } else {
                    if (!isRoot) {
                        startLogic = "<span class='logic Where'>Where</span>";
                    }
                }
                let selectedValues = "";
                let labelSelectedValues = "value";
                if (branch.line.values.length > 0) {
                    branch.line.values.forEach((selectedValue: any) => {
                        selectedValues += `<span class="selectedValue">${selectedValue.label}</span>`;
                    });
                    if (branch.line.values.length > 1) {
                        labelSelectedValues = "values";
                    }

                } else {
                    if (branch.children.length == 0) {
                        selectedValues += `<span class="selectedValue">Any</span>`;
                    }
                }
                if(selectedValues != "") {
                    selectedValues = `<div class='selectedValues'>With ${labelSelectedValues} : ${selectedValues}</div>`;
                }

                let htmlLI ="" ;
                if ((isRoot) && (nbChildren == 1)) {
                    htmlLI = `<li><div class="line">${startLogic}${startOption}<strong>${startLabel}${sSelceted}</strong> ${propLabel} <strong>${endLabel}${oSelceted}</strong>${selectedValues}</div>`;
                } else {
                    htmlLI = `<li><div class="line">${startLogic}${startOption} ${propLabel} <strong>${endLabel}${oSelceted}</strong>${selectedValues}</div>`;
                }
                htmlLI += this.formatChildsItems(branch.children, variables, false)+'</li>' ;
                htmlUL += htmlLI;
            });
            htmlUL += `</ul>`;
        }

        return htmlUL ;
    }

    private formatQuerySummary(
        queryJson: ISparJson,
        specProvider?: ISparnaturalSpecification
      ): string {
        let summary = `<div class="query-summary">`;
    
        setTimeout(() => {
          document.querySelectorAll(".query-summary").forEach((element) => {
            const div = element as HTMLDivElement;
            if (div.scrollHeight > div.clientHeight) {
              div.classList.add("scrollable");
            }
          });
        }, 100);
        let allVarible: any[] = queryJson.variables ;
        const reformattedArray = allVarible.map(({ termType, value }) => ( value ));
        console.log(reformattedArray) ;

        this.newQuerySummary = '<div class="SparnturalQuerySummaryComponent query-summary SparnaturalTheme">'+this.formatChildsItems(queryJson.branches, reformattedArray)+'</div>';
    
        const extractLastSegment = (uri: string): string =>
          uri ? uri.substring(uri.lastIndexOf("/") + 1) : "Inconnu";
    
        /*const processBranch = (branch: Branch, depth = 0): string => {
          let result = "";
          const indentation = "&nbsp;".repeat(depth * 4);
    
          const startLabel =
            branch.line.sType &&
            (specProvider?.getEntity(branch.line.sType)?.getLabel() ||
              extractLastSegment(branch.line.sType));
          const propLabel =
            branch.line.p &&
            (specProvider?.getProperty(branch.line.p)?.getLabel() ||
              extractLastSegment(branch.line.p));
    
          const endLabel =
            branch.line.oType &&
            (specProvider?.getEntity(branch.line.oType)?.getLabel() ||
              extractLastSegment(branch.line.oType));
    
          let line = `${indentation}<strong>${startLabel}</strong> → ${propLabel} → <strong>${endLabel}</strong>`;
    
          if (branch.line.values.length > 0) {
            line += ` = ${branch.line.values.join(", ")}`;
          }
    
          result += line;
    
          if (branch.children && branch.children.length > 0) {
            result += `<br>${indentation}<strong>WHERE</strong> `;
            branch.children.forEach((child, index) => {
              if (index > 0) result += `<br>${indentation}<strong>AND</strong> `;
              result += processBranch(child, depth + 1);
            });
          }
    
          return result;
        };*/
    
        /*queryJson.branches.forEach((branch, index) => {
          if (index > 0) summary += `<br><strong>AND</strong> `;
          summary += processBranch(branch);
        });*/
    
        summary += `${ this.newQuerySummary}</div>`;
        return summary;
      }
    
      // get l entity du predicat en utilisant getLabel dans ISpecificationEntry
    private getEntityLabel(entityURI: string): string {
        // Récupérer le type de l'objet avec la méthode getProperty
        //verifier si la specProvider est définie
        if (!this.specProvider) {
          console.error("specProvider is not defined.");
          return this?.extractLastSegment(entityURI); // Retourne le dernier segment de l'URI
        }
        const object = this.specProvider.getEntity(entityURI);
        if (object) {
          return object.getLabel() || entityURI;
        } else {
          return entityURI;
        }
    }

      
    private extractLastSegment = (uri: string): string =>
        uri ? uri.substring(uri.lastIndexOf("/") + 1) : "Inconnu";

}