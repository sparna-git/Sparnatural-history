import "datatables.net";
import $, { get } from "jquery";
import LocalDataStorage from "../storage/LocalDataStorage";
import { HTMLComponent } from "sparnatural";
import {
  Branch,
  SparnaturalQueryIfc,
  VariableTerm,
  VariableExpression,
} from "sparnatural";
import type { ISparnaturalSpecification } from "sparnatural";
import ConfirmationModal from "./ConfirmationModal";
import { SparnaturalHistoryElement } from "../../SparnaturalHistoryElement";
import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n";
import { getSettings } from "../settings/defaultSettings";
import DateFilterModal from "./DateFilter";
import { SparnaturalQuerySummaryComponent } from "../../sparnatural-query-summary/SparnaturalQuerySummaryComponent";

class HistorySection extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  private confirmationModal: ConfirmationModal;
  private dateFilterModal: DateFilterModal;
  lang: string;

  constructor(ParentComponent: HTMLComponent) {
    super("historySection", ParentComponent, null);
    const historyElement = document.querySelector(
      "sparnatural-history"
    ) as SparnaturalHistoryElement;
    if (!historyElement) return;
  }

  public setSpecProvider(specProvider: ISparnaturalSpecification) {
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();
    this.confirmationModal = new ConfirmationModal(this.html);
    this.dateFilterModal = new DateFilterModal(this.html);
    return this;
  }

  private async confirmAction(message: string): Promise<boolean> {
    const confirmed = await this.confirmationModal.show(message);
    return confirmed;
  }

  showHistory() {
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();
    if (!Array.isArray(history)) return;

    this.html
      .find(".history-overlay, #historyModal, #queryHistoryTable_wrapper")
      .remove();
    this.html.append('<div class="history-overlay"></div>');
    this.html.addClass("history-modal-open");

    const modalHtml = `
    <div id="historyModal" class="history-modal">
      <div class="table-container">
        <table id="queryHistoryTable" class="display"><tbody></tbody></table>
      </div>
      <div class="history-actions">
        <button id="resetHistory"><strong>${SparnaturalHistoryI18n.labels["clearHistory"]}</strong><i class="fas fa-eraser"></i></button>
        <button id="closeHistory" class="btn-red"><strong>${SparnaturalHistoryI18n.labels["close"]}</strong><i class="fas fa-times"></i></button>
      </div>
    </div>`;
    this.html.append(modalHtml);

    ($.fn.dataTable as any).ext.type.order["custom-fav-pre"] = (data: any) =>
      $(data).find("i").hasClass("fas") ? 1 : 0;

    $.fn.dataTable.ext.search.push((settings: any, data: any[]) => {
      const isoDateStr = data[6];
      const min = $("#minDate").val() as string;
      const max = $("#maxDate").val() as string;
      const date = new Date(isoDateStr);
      return (!min || new Date(min) <= date) && (!max || new Date(max) >= date);
    });

    const tableData = history
      .map((entry: SparnaturalQueryIfc) => {
        let parsedQuery;
        try {
          parsedQuery = typeof entry === "string" ? JSON.parse(entry) : entry;
        } catch {
          return null;
        }

        const entityType = this.getEntityType(parsedQuery);
        const entity = this.getEntityLabel(entityType);

        const dateObj = new Date(entry.metadata.date);
        const now = new Date();
        const isToday = dateObj.toDateString() === now.toDateString();
        const lang = getSettings().language === "fr" ? "fr-FR" : "en-US";
        const dateDisplay = isToday
          ? dateObj.toLocaleTimeString(lang, {
              hour: "2-digit",
              minute: "2-digit",
            })
          : dateObj.toLocaleDateString(lang, {
              day: "2-digit",
              month: "2-digit",
            });
        const dateISO = dateObj.toISOString();

        return [
          `<button class="favorite-query" data-id="${
            entry.metadata.id
          }"><i class="favorite-icon ${
            entry.metadata.isFavorite ? "fas" : "far"
          } fa-star"></i></button>`,
          entity,
          `<div class="summary-container">
    <textarea class="summary-natural" placeholder="${
      SparnaturalHistoryI18n.labels["SaisirResume"]
    }">${entry.summary || ""}</textarea>
    <button class="generate-summary-btn" data-id="${
      entry.id
    }" title="Generate Summary">
      <i class="fas fa-magic"></i>
    </button>
  </div>`,
          this.formatQuerySummary(parsedQuery, this.specProvider),
          dateDisplay,
          `<div class="actions-btn hidden">
          <button class="load-query btn-orange" data-id="${entry.metadata.id}" title="${SparnaturalHistoryI18n.labels["loadQuery"]}"><i class="fas fa-sync"></i></button>
          <button class="save-query btn-green" data-id="${entry.metadata.id}" title="${SparnaturalHistoryI18n.labels["copyQuery"]}"><i class="fas fa-copy"></i></button>
          <button class="delete-query btn-red" data-id="${entry.metadata.id}"><i class="fas fa-trash"></i></button>
        </div>`,
          dateISO,
        ];
      })
      .filter((row) => row !== null);

    $("#queryHistoryTable").DataTable({
      destroy: true,
      pageLength: 10,
      scrollY: "400px",
      scrollCollapse: true,
      ordering: true,
      info: true,
      pagingType: "simple_numbers",
      language: {
        search: "",
        searchPlaceholder: SparnaturalHistoryI18n.labels.search,
        lengthMenu: SparnaturalHistoryI18n.labels.entriesPerPage,
        info: SparnaturalHistoryI18n.labels.showingEntries,
        infoEmpty: SparnaturalHistoryI18n.labels.infoEmpty,
        infoFiltered: SparnaturalHistoryI18n.labels.infoFiltered,
        zeroRecords: SparnaturalHistoryI18n.labels.zeroRecords,
        emptyTable: SparnaturalHistoryI18n.labels.noData,
        paginate: {
          next: ">",
          previous: "<",
        },
      },
      order: [],
      columnDefs: [
        { targets: 0, orderable: true, type: "custom-fav", width: "3%" },
        { targets: 1, width: "8%", orderable: true, searchable: false },
        { targets: 2, width: "32%", orderable: false },
        { targets: 3, width: "40%", orderable: false },
        { targets: 4, width: "9%", orderable: true, searchable: false },
        { targets: 5, orderable: false, searchable: false },
        { targets: 6, visible: false },
      ],
      data: tableData,
      columns: [
        { title: SparnaturalHistoryI18n.labels["favorite"] },
        { title: SparnaturalHistoryI18n.labels["entity"] },
        { title: SparnaturalHistoryI18n.labels["summaryNatural"] },
        { title: SparnaturalHistoryI18n.labels["structure"] },
        { title: SparnaturalHistoryI18n.labels["date"] },
        { title: "" },
        { title: "Date ISO", visible: false },
      ],
      drawCallback: () => {
        this.enableQuerySummaryScrollEffect();
        this.initializeFavorites();

        document.querySelectorAll(".summary-natural").forEach((textarea) => {
          textarea.setAttribute("spellcheck", "false");
          textarea.setAttribute("autocorrect", "off");
          textarea.setAttribute("autocomplete", "off");
        });

        // Gestionnaire d'événements pour sauvegarder automatiquement le résumé
        $("#queryHistoryTable tbody").on(
          "blur",
          ".summary-natural",
          (event) => {
            const $textarea = $(event.currentTarget);
            const newSummary = $textarea.val(); // Ensure this is a string

            // Log the summary to check its type and content
            console.log("New Summary:", newSummary, typeof newSummary);

            const id = $textarea
              .closest("tr")
              .find(".favorite-query")
              .data("id");

            const storage = LocalDataStorage.getInstance();
            const history = storage.getHistory();
            const query = history.find(
              (q: SparnaturalQueryIfc) => q.metadata.id === id
            );
            if (query) {
              if (!query.metadata.description) {
                query.metadata.description = {};
              }
              // Ensure newSummary is treated as a string
              const summaryText =
                typeof newSummary === "object"
                  ? JSON.stringify(newSummary)
                  : String(newSummary);
              query.metadata.description[this.lang] = summaryText;
              storage.set("queryHistory", history);
            }
          }
        );

        $("#queryHistoryTable tbody").on(
          "input",
          ".summary-natural",
          function () {
            const $textarea = $(this);
            const $button = $textarea.siblings(".generate-summary-btn");
            const isEmpty = $textarea.val().toString().trim() === "";
            $button.prop("disabled", !isEmpty);
            $button.toggleClass("disabled", !isEmpty);
          }
        );

        // Empêche la génération si le champ n'est pas vide
        $("#queryHistoryTable tbody").on(
          "input",
          ".summary-natural",
          function () {
            const $textarea = $(this);
            const $button = $textarea.siblings(".generate-summary-btn");
            const isEmpty = $textarea.val().toString().trim() === "";

            // Activer ou désactiver le bouton selon que le champ est vide
            $button.prop("disabled", !isEmpty);

            // Optionnel : ajouter un style visuel pour le bouton désactivé
            $button.toggleClass("disabled", !isEmpty);
          }
        );

        $("#queryHistoryTable tbody").on(
          "click",
          ".generate-summary-btn",
          async (e) => {
            const $button = $(e.currentTarget);
            // désactiver le bouton et le griser tout de suite
            $button.prop("disabled", true);
            $button.addClass("disabled");

            const id = $button.data("id");
            const storage = LocalDataStorage.getInstance();
            const history = storage.getHistory();
            const query = history.find((q: any) => q.id === id);
            if (!query) return;

            const generatedSummary = await generateSummaryFromAPI(
              query.queryJson,
              this.lang,
              getSettings().urlAPI
            );
            console.log("API mistral", getSettings().urlAPI);

            if (generatedSummary) {
              $button.siblings(".summary-natural").val(generatedSummary);
              query.summary = generatedSummary;
              storage.set("queryHistory", history);
            }

            // Optionnel: si tu veux réactiver le bouton après génération
            // $button.prop("disabled", false);
            // $button.removeClass("disabled");
          }
        );

        $("#queryHistoryTable tbody")
          .on("mouseenter", "tr", function () {
            const actionsBtn = $(this).find(".actions-btn");
            actionsBtn.removeClass("hidden");
          })
          .on("mouseleave", "tr", function () {
            const actionsBtn = $(this).find(".actions-btn");
            actionsBtn.addClass("hidden");
          });

        this.html
          .find(".delete-query")
          .off("click")
          .on("click", async (e) => {
            const id = $(e.currentTarget).data("id");
            const confirmed = await this.confirmAction(
              SparnaturalHistoryI18n.labels["confirmDelRequest"]
            );
            if (confirmed) {
              storage.deleteQuery(id);
              this.showHistory();
            }
          });

        this.html
          .find(".load-query")
          .off("click")
          .on("click", (e) => this.loadQuery(e));
        this.html
          .find(".favorite-query")
          .off("click")
          .on("click", (e) => this.makeFavorite(e));

        this.html
          .find(".save-query")
          .off("click")
          .on("click", (e) => {
            const id = $(e.currentTarget).data("id");
            const query = history.find(
              (q: SparnaturalQueryIfc) => q.metadata.id === id
            );
            if (!query) return;
            navigator.clipboard
              .writeText(JSON.stringify(query, null, 2))
              .then(() =>
                this.showToast(SparnaturalHistoryI18n.labels["MessageExport"])
              )
              .catch(() => this.showToast("Échec de la copie", 4000));
          });

        $("#queryHistoryTable tbody").on(
          "click",
          ".generate-summary-btn",
          async function () {
            const $button = $(this);
            const id = $button.data("id"); // Récupérer l'ID de la ligne
            const storage = LocalDataStorage.getInstance();
            const history = storage.getHistory();
            const query = history.find((q: any) => q.id === id);

            if (!query) {
              console.error("Query not found for ID:", id);
              return;
            }
            const projectKey = "dbpedia-en"; // Remplacez par le projectKey approprié

            // Appeler la méthode pour générer le résumé
            const generatedSummary = await generateSummaryFromAPI(
              query.queryJson,
              "en",
              projectKey
            );

            if (generatedSummary) {
              // Mettre à jour le champ <textarea> avec le résumé généré
              $button.siblings(".summary-natural").val(generatedSummary);

              // Sauvegarder le résumé généré dans le stockage local
              query.summary = generatedSummary;
              storage.set("queryHistory", history);
            }
          }
        );
      },
    });

    const layoutRow = this.html
      .find("#queryHistoryTable_wrapper .dt-layout-row")
      .first();
    layoutRow.append(`
    <div class="dt-layout-cell" style="flex: 0 0 auto; display: flex; align-items: center; gap: 10px;">
      <div style="width: 10px;"></div>
      <button id="openDateFilter" class="btn-yellow">
        <i class="fas fa-calendar-alt"></i>
      </button>
    </div>
  `);

    this.html
      .find("#openDateFilter")
      .on("click", () => this.dateFilterModal.open());
    this.html.find("#resetHistory").on("click", async () => {
      const confirmed = await this.confirmAction(
        SparnaturalHistoryI18n.labels["confirmClearHistory"]
      );
      if (confirmed) {
        LocalDataStorage.getInstance().clearHistory();
        this.showHistory(); // refresh affichage
      }
    });
    this.html.find("#closeHistory, .history-overlay").on("click", () => {
      this.html.find("#historyModal, .history-overlay").remove();
      this.html.removeClass("history-modal-open");
    });

    this.html.find("#minDate, #maxDate").on("change", () => {
      this.html.find("#queryHistoryTable").DataTable().draw();
    });

    this.initializeFavorites();
    this.html.find("#queryHistoryTable .dt-scroll-body thead").remove();
  }

  private showToast(message: string, duration = 3000) {
    const toast = $(
      `<div class="custom-toast"><span class="toast-message">${message}</span></div>`
    );
    this.html.append(toast);
    toast.fadeIn(200);
    setTimeout(() => toast.fadeOut(400, () => toast.remove()), duration);
  }

  private loadQuery(event: JQuery.ClickEvent) {
    const id = $(event.currentTarget).data("id");
    const storage = LocalDataStorage.getInstance();
    const query = storage
      .getHistory()
      .find((q: SparnaturalQueryIfc) => q.metadata.id === id);
    if (!query) return;

    const historyElement = document.querySelector(
      "sparnatural-history"
    ) as SparnaturalHistoryElement;
    if (historyElement) {
      historyElement.triggerLoadQueryEvent(query);
      $("#historyModal, .history-overlay").remove();
      $("body").removeClass("history-modal-open");
    }
  }

  private makeFavorite(event: JQuery.ClickEvent) {
    const id = $(event.currentTarget).data("id");
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();
    const query = history.find(
      (q: SparnaturalQueryIfc) => q.metadata.id === id
    );
    if (!query) return;

    query.metadata.isFavorite = !query.metadata.isFavorite;
    storage.set("queryHistory", history);
    this.initializeFavorites();
  }

  private initializeFavorites() {
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();

    $(".favorite-query").each(function () {
      const id = $(this).data("id");
      const query = history.find(
        (q: SparnaturalQueryIfc) => q.metadata.id === id
      );
      const icon = $(this).find("i");
      icon
        .removeClass("fas fa-star far fa-star")
        .addClass(query?.metadata.isFavorite ? "fas fa-star" : "far fa-star")
        .css("color", query?.metadata.isFavorite ? "#ffcc00" : "#b5b5b5");
    });
  }

  private enableQuerySummaryScrollEffect() {
    document.querySelectorAll(".query-summary").forEach((element) => {
      const div = element as HTMLElement;
      div.classList.toggle("has-scroll", div.scrollHeight > div.clientHeight);
      div.addEventListener("scroll", function () {
        this.classList.toggle("scrolled", this.scrollTop > 0);
      });
    });
  }

  private extractLastSegment = (uri: string): string =>
    uri ? uri.substring(uri.lastIndexOf("/") + 1) : "Inconnu";

  private formatQuerySummary(
    queryJson: SparnaturalQueryIfc,
    specProvider?: ISparnaturalSpecification
  ): string {
    const summary = new SparnaturalQuerySummaryComponent(
      specProvider,
      queryJson,
      getSettings().language
    );
    return summary.querySummary;
  }

  private getEntityLabel(entityURI: string): string {
    return (
      this.specProvider?.getEntity(entityURI)?.getLabel() ||
      this.extractLastSegment(entityURI)
    );
  }

  private getFirstVariableValue(
    variable: VariableTerm | VariableExpression
  ): string | null {
    if ("value" in variable) return variable.value;
    if ("expression" in variable && "value" in variable.expression.expression)
      return variable.expression.expression.value;
    return null;
  }

  private getEntityType(queryJson: SparnaturalQueryIfc): string {
    if (!queryJson.variables?.length) return "Inconnu";
    const firstVar = this.getFirstVariableValue(queryJson.variables[0]);
    const findMatch = (b: Branch) => b.line.s === firstVar;
    const branch = queryJson.branches.find(findMatch);
    const child = queryJson.branches.flatMap((b) => b.children).find(findMatch);
    return (
      branch?.line.sType ||
      child?.line.sType ||
      queryJson.branches[0]?.line.sType ||
      "Inconnu"
    );
  }
}

async function generateSummaryFromAPI(
  queryJson: any,
  lang: string = "fr",
  mistralApiUrl: string = getSettings().urlAPI
): Promise<string | null> {
  try {
    const response = await fetch(
      `http://localhost:3000/${projectKey}/api/v1/query2text?query=${encodeURIComponent(
        JSON.stringify(queryJson)
      )}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to generate summary:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.text || "No summary generated.";
  } catch (error) {
    console.error("Error while calling the API:", error);
    return "Error while generating summary.";
  }
}
export default HistorySection;
