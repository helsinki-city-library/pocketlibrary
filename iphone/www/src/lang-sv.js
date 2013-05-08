/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  _
*/
(function() {
    "use strict";
    
    window.localization = {
        messages: {
            reservationComplete: function() {
                return "Din reservering lyckades."
            },
            reservationFailed: function() {
                return "Din reservering misslyckades. Ta kontakt med biblioteket om du vill reservera verket.";
            },
            deleteWorkConfirmation: function(item) {
                return "Du tar bor verket " + item.get("title") + " från listan";
            },
            wait: function() {
                return "Vänta...";
            },
            logIn: function() {
                return "Logga in";
            },
            noWorks: function() {
                return "Inga träffar";
            },
            renewLoan: function(item) {
                var title = item ? item.get("title") : "Tuntematon";
                return 'Du förnuar lånen \'' + title + '\"';
            },
            renewDueDateFailed: function() {
                return "Kan inte lånas. Troligen det det finns beställningar till andra kunder.";
            },
            renewFailed: function(error) {
                return "Kan inte förnyas. Troligen det det finns beställningar till andra kunder.";
            },
            reservationInfoText: function() {
                return "Här finns endast beställningar som är på väg till eller kan hämtas på ett bibliotek. Kontrollera alla dina beställningar på <a href='http://haku.helmet.fi/iii/mobile'>haku.helmet.fi/iii/mobile.</a>";
            },
            barcodeReadCancelled: function() {
                return "Avläsningen av streckkoden inställdes";
            },
            barcodeReadFailed: function() {
                return "Streckkoden kan inte avläsas. Försök igen.";
            },
            friendLoanFailedBarcode: function() {
                return "Kompislånet misslyckades. Kontrollera din PIN-kod";
            },
            renewAllBooksConfirmation: function() {
                return "Vill du säkert förnya alla dina lån?";
            },
            dueDate: function(due) {
                return "Förfallodag " + due.format("DD.MM.YYYY");
            },
            fetching: function() {
                return 'Söker';
            },
            item: function() {
                return "stycket";
            },
            items: function() {
                return "stycket";
            },
            fetchMore: function() {
                return "Mer...";
            },
            finish: function() {
                return "Färdig";
            },
            modify: function() {
                return "redigera";
            },
            error: function() {
                return "Fel i sökningen";
            },
            friendloanHoldRestriction: function() {
                return "Kan inte lånas, det finns beställningar till andra kunder.";
            },
            holdCount: function(hold_count, title) {
                return "Verket \"" + title + "\" har " + hold_count +
                    ((hold_count > 1) ? " beställningar." : " beställning.");
            },
            friendloanFail: function() {
                return "Bokens data hittades inte. Kolla streckkoden.";
            },
            timeout: function() {
                return "Frågan tog för lång tid.";
            },
            pincodeWrong: function() {
                return "PIN-koden är fel.";
            },
            notificationTitle: function() {
                return "Obs!";
            },
            confirmButtonLabels: function() {
                return "Annulera, Fortsätt";
            },
            type: function(type, extent) {
                switch (type) {
                case "book":
                    return "Bok";
                case "film":
                    if (extent) {
                        return _.map(extent, function(e) {
                            return (/DVD/).exec(e) ? "DVD" :
                                        (/Blu/).exec(e) ? "Blu-Ray" :
                                            (/video/).exec(e) ? "VHS" :
                                                    "Film";
                        })[0];
                    }
                    return "Film";
                case "ebook":
                    return "E-bok";
                case "periodical":
                    return "Tidskrift";
                case "map":
                    return "Karta";
                case "sound recording":
                case "music recording":
                    if (extent) {
                        return _.map(extent, function(e) {
                            return (/CD/).exec(e) ? "CD-skiva" :
                                        (/äänilevy/).exec(e) ? "LP-skiva" :
                                            (/äänikas/).exec(e) ? "Kassett" :
                                                    "Inspelning";
                        })[0];
                    }
                    return "Inspelning";
                case "sheet music":
                    return "Musiktryck";
                case "www":
                    return "Länk";
                }
                return "Verk";
            },
            fbRecommendTitle: function(model) {
                return "Perttu rekommenderar: " + model.get("title");
            },
            fbRecommendCaption: function(model) {
            },
            fbRecommendDescription: function(model) {
                return "Hitta HelMet-bibliotekets samlingar på HelMet-pocketbibban.";
            },
            fbRecommendationSuccessful: function() {
                return "Suositus jaettu onnistuneesti!";
            },
            confirmReservation: function(item, library) {
                return "Du reserverar boken " + item.get("title") + " från " + library + ".\nFortsätt?";
            },
            waitingForPickup: function() {
                return "Upphämtning senast";
            },
            itemInTransit: function() {
                return "På väg till biblioteket";
            }
        },
        okButton: 2,
        fbAppId: 000
    };
}());
