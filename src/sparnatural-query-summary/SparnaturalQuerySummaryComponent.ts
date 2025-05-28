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
    variableDisplayed: string[] = [];

    static ICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  
    constructor( specProvider: ISparnaturalSpecification, queryJson: ISparJson, language: string) {
      super("SparnaturalQuerySummaryComponent", null, null);
      this.specProvider = specProvider;
      this.queryJson = queryJson;
      this.language = language;
      this.render();
    }

    render(): this {
        this.#initLang();
        this.querySummary = this.formatQuerySummary(this.queryJson, this.specProvider);
        this.addPaddings();

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
                let endLogic = "" ;
                nbChildren++ ;  
                let sSelceted = "" ;
                let oSelceted = "" ;
                let whereStartLabel = "" ;
                let displaystartLabel = "" ;
                console.log(branch) ;
                if ((variables.includes(branch.line.s)) && (isRoot)) {
                    if(!this.variableDisplayed.includes(branch.line.s)){
                        this.variableDisplayed.push(branch.line.s);
                        sSelceted = SparnaturalQuerySummaryComponent.ICON_EYE ;
                    }
                }
                if (variables.includes(branch.line.o)) {
                    
                    if(!this.variableDisplayed.includes(branch.line.o)){
                        this.variableDisplayed.push(branch.line.o);
                        oSelceted = SparnaturalQuerySummaryComponent.ICON_EYE ;
                    }
                    
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
                    startOption += `<span class='startOption optional'>${SparnaturalQuerySummaryI18n.labels.optionnal}</span> `;
                }
                if (branch?.notExists === true) {
                    startOption += `<span class='startOption notExist'>${SparnaturalQuerySummaryI18n.labels.notexist}</span> `;
                }
                if (!isRoot) {
                    displaystartLabel = "grayStartLabel" ;
                }

                if (nbChildren > 1) {
                      //startLogic = `<span class='logic And'>${SparnaturalQuerySummaryI18n.labels.and}</span>`;
                      displaystartLabel = "grayStartLabel" ;
                    
                } else {
                    if (!isRoot) {
                        //startLogic = `<span class='logic Where'>${SparnaturalQuerySummaryI18n.labels.where}</span>`;
                    }
                }
                let selectedValues = "";
                let labelSelectedValues = "";
                if (branch.line.values.length > 0) {
                    let nbValue = 0;
                    branch.line.values.forEach((selectedValue: any) => {
                        if (nbValue > 0) {
                            selectedValues += ", ";
                        }
                        selectedValues += `<span class="selectedValue">${selectedValue.label}</span>`;
                        nbValue++;
                    });
                    if (branch.line.values.length > 1) {
                        labelSelectedValues =  `${SparnaturalQuerySummaryI18n.labels.values} : ` ;
                    }

                } else {
                    if (branch.children.length == 0) {
                        selectedValues += `<span class="selectedValue">${SparnaturalQuerySummaryI18n.labels.any}</span>`;
                    } else {
                        //endLogic = ` <span class='logic Where'>${SparnaturalQuerySummaryI18n.labels.where}</span>`;
                    }
                }
                if(selectedValues != "") {
                    selectedValues = `<div class='selectedValues'>${labelSelectedValues}${selectedValues}</div>`;
                }
                if (nbChildren == 1) {
                    whereStartLabel = `${startOption} <strong class="sumSujet ${displaystartLabel}">${startLabel}${sSelceted}</strong> `;
                } else {
                    whereStartLabel = `<strong class="sumSujet ${displaystartLabel}">${startLabel}${sSelceted}</strong> ${startOption} `;
                }

                let htmlLI ="" ;
                if ((isRoot) && (nbChildren == 1)) {
                    htmlLI = `<li><div class="line">${startLogic}${startOption}<strong class="sumSujet">${startLabel}${sSelceted}</strong> <span class="sumPredicat">${propLabel}</span> <strong class="sumObjet">${endLabel}${oSelceted}</strong>${endLogic}${selectedValues}</div>`;
                } else {
                    htmlLI = `<li><div class="line">${startLogic} ${whereStartLabel} <span class="sumPredicat">${propLabel}</span> <strong class="sumObjet">${endLabel}${oSelceted}</strong>${selectedValues}${endLogic}</div>`;
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
        let summary = ``;
    
        let allVarible: any[] = queryJson.variables ;
        const reformattedArray = allVarible.map(({ termType, value }) => ( value ));
        console.log(queryJson);

        summary = '<div class="SparnturalQuerySummaryComponent query-summary SparnaturalTheme">'+this.formatChildsItems(queryJson.branches, reformattedArray)+'</div>';
    
        return summary;
      }

      
    private extractLastSegment = (uri: string): string =>
        uri ? uri.substring(uri.lastIndexOf("/") + 1) : "Inconnu";


    private addPaddings() {

        // create the temporary Element
      
        const ruler = document.createElement('div');
        ruler.style.width = 'auto';
        ruler.style.position = 'absolute';
        ruler.style.whiteSpace = 'nowrap';
        // Adding the element as a child to myElement.
      
        // it will be added to the DOM
        ruler.innerHTML = this.querySummary;
        document.body.appendChild(ruler);
        let uls = ruler.querySelectorAll('ul');
        uls.forEach((ul:any) => {
            if (ul.parentElement.tagName == 'LI') {
                //ul.parentElement.style.color = "red";
                let sumSujets = ul.querySelectorAll('.sumSujet');
                let width = sumSujets[0].offsetWidth ;
                ul.style.marginLeft  = width+'px' ;
              }
        }) ;
        this.querySummary = ruler.innerHTML;
      
        document.body.removeChild(ruler);
      
      };

}