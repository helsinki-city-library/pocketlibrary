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
                return "Your reservation was successful"
            },
            reservationFailed: function() {
                return "Reservation failed. Please contact your library for reservation.";
            },
            deleteWorkConfirmation: function(item) {
                return "You are about to remove " + item.get("title") + " from the wishlist";
            },
            wait: function() {
                return "Wait...";
            },
            logIn: function() {
                return "Log in";
            },
            noWorks: function() {
                return "No titles";
            },
            renewLoan: function(item) {
                var title = item ? item.get("title") : "Unknown";
                return 'You are about to renew \'' + title + '\"';
            },
            renewDueDateFailed: function() {
                return "The item is not available for loan because of reservation queue or restrictions in your account.";
            },
            renewFailed: function(error) {
                return "The item can’t be renewed because of reservation queue or restrictions in your account.";
            },
            reservationInfoText: function() {
                return "The list includes your reservations that have arrived or in transit to your library. To see all your reservations, visit <a href='http://haku.helmet.fi/iii/mobile'>HelMet-mobile web page</a>";
            },
            barcodeReadCancelled: function() {
                return "Barcode reading cancelled";
            },
            barcodeReadFailed: function() {
                return "Reading the barcode failed. Try again";
            },
            friendLoanFailedBarcode: function() {
                return "Friend loan failed. Check the barcode";
            },
            renewAllBooksConfirmation: function() {
                return "Do you want to renew all loans?";
            },
            dueDate: function(due) {
                return "Due date " + due.format("DD.MM.YYYY");
            },
            fetching: function() {
                return 'Loading';
            },
            item: function() {
                return "item";
            },
            items: function() {
                return "items";
            },
            fetchMore: function() {
                return "Get more...";
            },
            finish: function() {
                return "Done";
            },
            modify: function() {
                return "Edit";
            },
            error: function() {
                return "Error loading information.";
            },
            friendloanHoldRestriction: function() {
                 return "The work cannot be loaned because other customers "
                    + "have holds on the work.";
            },
            friendloanUnconfirmed: function() {
                return "The loan could not be confirmed because of connection troubles. "
                    + " Verify from your own loans, if the loan was succesful or not.";
            },
            
            holdCount: function(hold_count, title) {
                return "The work \"" + title + "\" has " + hold_count +
                    ((hold_count > 1) ? " holds." :" hold.");

             },
            friendloanFail: function() {
                return "Loading title information failed. Check the barcode";
            },
            timeout: function() {
                return "Problems with the connection. Please try again later!";
            },
            timeout_retry: function() {
                return "Problems with the connection. Retry?";
             },

            pincodeWrong: function() {
                return "Incorrect PIN";
            },
            notificationTitle: function() {
                return "Attention";
            },
            confirmButtonLabels: function() {
                return "Cancel, Continue";
            },
            type: function(type, extent) {
                switch (type) {
                case "book":
                    return "Book";
                case "film":
                    if (extent) {
                        return _.map(extent, function(e) {
                            return (/DVD/).exec(e) ? "DVD" :
                                        (/Blu/).exec(e) ? "Blu-Ray" :
                                            (/video/).exec(e) ? "Videocassette" :
                                                    "Film";
                        })[0];
                    }
                    return "Film";
                case "ebook":
                    return "Audio book";
                case "periodical":
                    return "Magazine";
                case "map":
                    return "Map";
                case "sound recording":
                case "music recording":
                    if (extent) {
                        return _.map(extent, function(e) {
                            return (/CD/).exec(e) ? "CD" :
                                        (/äänilevy/).exec(e) ? "LP record" :
                                            (/äänikas/).exec(e) ? "Cassette" :
                                                    "Recording";
                        })[0];
                    }
                    return "Recording";
                case "sheet music":
                    return "Sheet music";
                case "www":
                    return "Link";
                }
                return "Title";
            },
            fbRecommendTitle: function(model) {
                return "Perttu recommends: " + model.get('title');
            },
            fbRecommendCaption: function(model) {
            },
            fbRecommendDescription: function(model) {
                return "HelMet Library goes mobile – find more to read in HelMet Pocket Library.";
            },
            fbRecommendationSuccessful: function() {
                return "Recommendation was successfully shared";
            },
            confirmReservation: function(item, library) {
                return "Olet varaamassa kirjaa "+item.get("title")+" kirjastosta "+library+".\nHaluatko jatkaa?";
            },
            waitingForPickup: function() {
                return "Pick up by";
            },
            itemInTransit: function() {
                return "In transit to your library";
            }
        },
        okButton: 2,
        fbAppId: 000
    };
}());
