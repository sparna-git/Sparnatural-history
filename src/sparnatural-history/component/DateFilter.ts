import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n";

class DateFilterModal {
  private modalElement: JQuery<HTMLElement>;

  constructor(private container: JQuery<HTMLElement>) {
    this.modalElement = $(`
      <div id="dateFilterModal" class="modal">
        <div class="modal-content">
          <h3>${
            SparnaturalHistoryI18n.labels["dateFilterTitle"] ||
            "Filtrer par date"
          }</h3>
          <div style="margin: 10px 0;">
            <label for="minDate">${
              SparnaturalHistoryI18n.labels["from"]
            }</label>
            <input type="date" id="minDate" />
            <label for="maxDate">${SparnaturalHistoryI18n.labels["to"]}</label>
            <input type="date" id="maxDate" />
            <div id="dateFilterError" style="color:red;display:none;margin-top:5px;"></div>
          </div>
          <div class="modal-buttons">
            <button id="applyDateFilter" class="btn-clear">
              ${SparnaturalHistoryI18n.labels["clear"] || "Clear"}
            </button>
            <button id="cancelDateFilter" class="btn-delete">
              ${SparnaturalHistoryI18n.labels["close"] || "Fermer"}
            </button>
          </div>
        </div>
      </div>
    `);

    if (this.container.find("#dateFilterModal").length === 0) {
      this.container.append(this.modalElement);
    }

    // Contrôle : la date de début ne peut pas être après la date de fin
    this.modalElement.on("change", "#minDate, #maxDate", () => {
      const minDate = ($("#minDate").val() as string) || "";
      const maxDate = ($("#maxDate").val() as string) || "";
      const errorDiv = $("#dateFilterError");

      if (minDate && maxDate && minDate > maxDate) {
        errorDiv.text(
          SparnaturalHistoryI18n.labels["dateFilterError"] ||
            "La date de début doit être antérieure à la date de fin."
        );
        errorDiv.show();
        $("#applyDateFilter").prop("disabled", true);
      } else {
        errorDiv.hide();
        $("#applyDateFilter").prop("disabled", false);
      }
    });

    // Contrôle : impossible de sélectionner une date future
    const today = new Date().toISOString().split("T")[0];
    this.modalElement.find("#minDate, #maxDate").attr("max", today);

    // Bouton "Clear"
    $("#applyDateFilter").on("click", () => {
      $("#minDate").val("");
      $("#maxDate").val("");
      $("#dateFilterError").hide();
      $("#applyDateFilter").prop("disabled", false);
      $("#queryHistoryTable").DataTable().draw();
    });

    // Bouton "Annuler"
    $("#cancelDateFilter").on("click", () => {
      this.modalElement.hide();
    });
  }

  public open(): void {
    this.modalElement.show();
  }
}

export default DateFilterModal;
