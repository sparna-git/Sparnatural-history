// will using the same class I18 or a new class I18History and same thing for labels on assests lang ?

export class SparnaturalQuerySummaryI18n {
    static i18nLabelsResources: any = {
      en: require("./assets/lang/en-summary.json"),
      fr: require("./assets/lang/fr-summary.json"),
    };
  
    public static labels: any;
  
    private constructor() {}
  
    static init(lang: any) {
      SparnaturalQuerySummaryI18n.labels =
      SparnaturalQuerySummaryI18n.i18nLabelsResources[lang];
    }
  }
  