/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  _ 
*/
(function() {
    "use strict";
    
    window.localization = {
        messages: {
            reservationComplete: function() {
                return "Varaaminen onnistui.";
            },
            reservationFailed: function() {
                return "Varaaminen epäonnistui. Ota yhteys kirjastoon varauksen tekoa varten.";
            },
            deleteWorkConfirmation: function(item) {
                return "Olet poistamassa listalta teosta " + item.get("title");
            },
            wait: function() {
                return "Odota...";
            },
            logIn: function() {
                return "Kirjaudu sisään";
            },
            noWorks: function() {
                return "Ei teoksia";
            },
            renewLoan: function(item) {
                var title = item ? item.get("title") : "Tuntematon";
                return 'Olet uusimassa lainaa \'' + title + '\"';
            },
            renewDueDateFailed: function() {
                return "Lainaus ei onnistunut. Teos on varattu toiselle asiakkaalle tai sinulla ei ole lainausoikeutta teokseen.";
            },
            renewFailed: function(error) {
                return "Uusiminen ei onnistunut. Teos on varattu toiselle asiakkaalle tai sinulla ei ole lainausoikeutta teokseen.";
            },
            reservationInfoText: function() {
                return "Listaan sisältyvät matkalla ja noudettavissa olevat varauksesi. Tarkista kaikki varauksesi <a href='http://haku.helmet.fi/iii/mobile'>HelMet-mobiiliselainversiosta</a>";
            },
            barcodeReadCancelled: function() {
                return "Viivakoodin lukeminen peruutettiin";
            },
            barcodeReadFailed: function() {
                return "Viivakoodin lukeminen epäonnistui. Yritä uudelleen";
            },
            friendLoanFailedBarcode: function() {
                return "Kaverilaina ei onnistunut. Tarkista viivakoodi";
            },
            renewAllBooksConfirmation: function() {
                return "Oletko varma, että haluat uusia kaikki lainat?";
            },
            dueDate: function(due) {
                return "Eräpäivä " + due.format("DD.MM.YYYY");
            },
            fetching: function() {
                return 'Haetaan';
            },
            item: function() {
                return "kappale";
            },
            items: function() {
                return "kappaletta";
            },
            fetchMore: function() {
                return "Hae lisää...";
            },
            finish: function() {
                return "Valmis";
            },
            modify: function() {
                return "Muokkaa";
            },
            error: function() {
                return "Virhe haettaessa tietoja.";
            },
            friendloanHoldRestriction: function() {
                return "Nidettä ei voi lainata, koska muut asiakkaat ovat "
                    + "tehneet siihen varauksia.";
            },
            friendloanUnconfirmed: function() {
                return "Lainan onnistumista ei saatu varmistettua yhteysongelmien takia. "
                    + " Tarkista omista lainoistasi, onnistuiko laina.";
            },
            holdCount: function(hold_count, title) {
                return "Teokseen \"" + title + "\" on " + hold_count +
                    ((hold_count > 1) ? " varausta." : " varaus.");
            },
            friendloanFail: function() {
                return "Kirjan tietojen hakeminen epäonnistui. Tarkista viivakoodi.";
            },
            timeout: function() {
                return "Palvelimeen ei saatu yhteyttä. Yritä myöhemmin uudelleen!";
            },
            timeout_retry: function() {
                return "Palvelimeen ei saatu yhteyttä. Yritetäänkö uudelleen?";
            },
            pincodeWrong: function() {
                return "Pin-koodi väärin";
            },
            notificationTitle: function() {
                return "Huomio";
            },
            confirmButtonLabels: function() {
                return "Peruuta, Jatka";
            },
            type: function(type, extent) {
                switch (type) {
                case "book":
                    return "Kirja";
                case "film":
                    if (extent) {
                        return _.map(extent, function(e) {
                            return (/DVD/).exec(e) ? "DVD" :
                                        (/Blu/).exec(e) ? "Blu-Ray" :
                                            (/video/).exec(e) ? "VHS" :
                                                    "Elokuva";
                        })[0];
                    }
                    return "Elokuva";
                case "ebook":
                    return "E-kirja";
                case "periodical":

                    return "Lehti";
                case "map":
                    return "Kartta";
                case "sound recording":
                case "music recording":
                    if (extent) {
                        return _.map(extent, function(e) {
                            return (/CD/).exec(e) ? "CD-levy" :
                                        (/äänilevy/).exec(e) ? "LP-levy" :
                                            (/äänikas/).exec(e) ? "C-kasetti" :
                                                    "äänite";
                        })[0];
                    }
                    return "Äänite";
                case "sheet music":
                    return "Nuotti";
                case "www":
                    return "Linkki";
                }
                return "Teos";
            },
            fbRecommendTitle: function(model) {
                return "Perttu suosittelee: " + model.get("title");
            },
            fbRecommendCaption: function(model) {
            },
            fbRecommendDescription: function(model) {
                return "Poimi HelMetin hyvät jutut HelMet-taskukirjastosta.";
            },
            fbRecommendationSuccessful: function() {
                return "Suositus jaettu onnistuneesti!";
            },
            confirmReservation: function(item, library) {
                return "Olet varaamassa kirjaa " + item.get("title") + " kirjastosta " + library + ".\nHaluatko jatkaa?";
            },
            waitingForPickup: function() {
                return "Noudettava viimeistään";
            },
            itemInTransit: function() {
                return "Matkalla noutokirjastoon";
            }
        },
        okButton: 2,
        fbAppId: 000
    };
}());
