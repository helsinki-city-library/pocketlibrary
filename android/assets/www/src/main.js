/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  console, $, _, iScroll, confirm, device, alert, notification, FB, CDV
*/

$(function() {
    "use strict";

    $(document).bind('touchmove', function(e) { e.preventDefault(); });
    window.device = { platform: "android" };

    // Set timeout for 6 seconds
    $(function() {
        $.ajaxSetup({
            timeout: 6000,
            cache: false
        });
    });
    
    var mainMenuView = new window.MainMenuView(),
        loginView = new window.LoginView(),
        ownStuffView = new window.OwnStuffView(),
        settingsView = new window.SettingsView(),
        friendLoanView = new window.FriendLoanView(),
        workView = new window.WorkView(),
        receiptView = new window.ReceiptView(),
        libraryView = new window.LibraryView(),
        markedView = new window.MarkedView(),
        userBarcodeView = new window.UserBarcodeView(),
        barcodeConfirmView = new window.BarcodeConfirmView(),
        reserveBookView = new window.ReserveBookView(),
        views = [mainMenuView, loginView, ownStuffView, settingsView, receiptView, libraryView, workView, userBarcodeView, reserveBookView],
        oldY = 0,
        timeout = null,
        ajaxRequests = [],
        fadeBackButtonIn = function() {
            $('.back').show();
        },
        fadeBackButtonOut = function() {
            $('.back').hide();
        },
        setWorkDataAttributes = function() {
            $('#work')
                .attr('data-marked', window.MarkedWorkCollection.get(workView.model.get("library_id")) !== undefined)
                .attr('data-loaned', window.LoanWorkCollection.get(workView.model.id) !== undefined);
        },
        updateLoanUrl = function() {
            ownStuffView.collections.loans.url = ownStuffView.collections.loans.constructUrl();
        },
        animate = function(fromClass, toClass, from, to) {
            var $from = $(from), $to = $(to);
            
            // Remove animations if device is Android
            if (typeof device !== "undefined" && device.platform === 'android') {
                $to.show();
                _.defer(function() {
                    $from.hide();
                });
                return;
            }

            $from.one('webkitAnimationEnd', function() {
                $from.removeClass('backface').hide().removeClass(fromClass);
            });
            $to.one('webkitAnimationEnd', function() {
                $to.removeClass(toClass).removeClass('backface');
            });

            $from.addClass('backface ' + fromClass);
            $to.show().addClass('backface ' + toClass);
        },
        animateLeft = function(from, to) {
            var trig = false,
                closeLoader = function() {
                    $(to).show();
                    $('#loader').fadeOut(150);
                    _.defer(function() {
                        if (window.iscroll) { window.iscroll.refresh(); }
                    });
                },
                trigger = function() {
                    if (trig) {
                        closeLoader();
                    } else {
                        trig = true;
                    }
                };
            if ($("#loader").hasClass("sent") && $("#loader").hasClass("no-loader") === false) {
                animate('left-out', 'right-in', from, "#loader");

                trig = false;
                _.delay(trigger, 1000);
                $('#loader').one('loadComplete', trigger);
            } else {
                animate('left-out', 'right-in', from, to);
            }
        },
        animateRight = function(from, to) {
            animate('right-out', 'left-in', from, to);
        },

        setTitle = function(title, direction) {
            // Skip if title has not changed. Makes it a bit easier to manage
            // the transitions (esp. main-menu => marked and back)
            if (title === $('#top-bar .title').html()) {
                return;
            }
    
            $('#top-bar .title').html(title);
        },

        fromMainTransition = function(from, to) {
            var $to = $('#' + to);
            animateLeft('#main-menu', '#' + to);
            setTitle($to.data('title'));
            fadeBackButtonIn();
            _.defer(function() {
                $('#main-menu a.selected').removeClass('selected');
            });
        },

        orchestrator = new window.Orchestrator({
            "main-menu:*": fromMainTransition,
            "*:main-menu": function(from, to) {
                var $from = $('#' + from);

                animateRight('#' + from, '#main-menu');
                $from.one('webkitAnimationEnd', function() {
                    $from.hide();
                });

                setTitle($('#main-menu').data('title'));
                fadeBackButtonOut();

                if (typeof device !== "undefined" && device.platform === 'android') {
                    $('#' + from).hide();
                }
            },

            "logged-in:main-menu": function() {
                if (typeof device !== "undefined" && device.platform.toLowerCase() === "android") {
                    $('#login-screen').hide();
                    $('#main-menu, #top-bar').show();
                } else {
                    $('#main-menu, #top-bar').addClass('right-in').show();
                    $('#login-screen').addClass('left-out');
                    $('#main-menu').one('webkitAnimationEnd', function() {
                        $('#login-screen').removeClass('left-out').hide();
                        $('#main-menu, #top-bar').removeClass('right-in');
                    });
                }
                return false;
            },

            "main-menu:own-stuff": function(from, to) {
                $('#loader').addClass("no-loader");
                fromMainTransition(from, to);
                ownStuffView.selectCollection('loans');
                return false;
            },
            "main-menu:library": function(from, to) {
                $('#loader').addClass("no-loader");
                libraryView.selectCollection("recommended");
            },
            "main-menu:friend-loan": function(from, to) {
                $('.barcode-input').val('');
            },
            "^(?!receipt|marked):work": function(from) {
                animateLeft('#' + from, '#work');
            },
            "work:^(?!receipt|marked)": function(from, to) {
                var to_sel = '#' + to;
                setTitle($(to_sel).data('title'), 'title-left-in');
                animateRight('#work', to_sel);
                workView.cancelFetch();
            },
            "*:work": function(from, to) {
                setWorkDataAttributes();
            },
            "library:marked": function() {
                if (typeof device === "undefined" || device.platform !== 'android') {
                    $('#library .search-bar').hide();
                }
            },
            "marked:library": function() {
                if (typeof device === "undefined" || device.platform !== 'android') {
                    $('#library').one('webkitAnimationEnd', function() {
                        $('#library .search-bar').attr('style', null);
                    });
                }
            },
            "library:work": function() {
                setWorkDataAttributes();
                if (libraryView.isSearchMode()) {
                    animateLeft('#library', '#work');
                    $('body')
                        .removeClass('search-mode')
                        .addClass('to-right');
                    return false;
                }
            },
            "work:library": function() {
                if (libraryView.isSearchMode()) {
                    $('#top-bar .title').html($('#library').data('title'));
                    animateRight('#work', '#library');
                    $('body')
                        .removeClass('to-right')
                        .addClass('search-mode from-right');
                    return false;
                }
            },
            "library:main-menu": function() {
                libraryView.clearFetchQueue();
                $('body').removeClass('search-mode from-right');
            },
            "*:marked": function(from, to, direction) {
                var markedButton = $('#top-bar .marked-button');
                markedButton.removeClass("pin-button");
                markedButton.addClass("edit-marked-button");
                markedButton.html('<p><a class="edit-marked">' + window.localization.messages.modify() + '</a></p>');

                if (direction) {
                    animateRight('#' + from, '#marked');
                    setTitle($('#marked').data('title'), 'title-left-in');
                } else {
                    animateLeft('#' + from, '#marked');
                    setTitle($('#marked').data('title'), 'title-right-in');
                }
                window.MarkedWorkCollection.fetch();
                $("#marked ul").show();
                return false;
            },
            "marked:*": function(from, to, direction) {
                var markedButton = $('#top-bar .marked-button');
                markedButton.removeClass("edit-marked-button");
                markedButton.removeClass("edit-marked-ready-button");
                markedButton.addClass("pin-button");
                markedButton.html('<p><span /><p>');
                
                $('#top-bar .marked-button').fadeIn();

                if (direction) {
                    animateRight('#marked', '#' + to);
                    setTitle($('#' + to).data('title'), 'title-left-in');
                } else {
                    animateLeft('#marked', '#' + to);
                    setTitle($('#' + to).data('title'), 'title-right-in');
                }

                return false;
            },
            "marked:friend-loan": function() {
                $('#marked').one('webkitAnimationEnd', function() {
                    $('#wrapper').hide();
                });
                if (typeof device !== "undefined" && device.platform === 'android') {
                    $('#wrapper').hide();
                }
            },
            "*:receipt": function(from, to) {
                window.CurrentUser.refreshUserInfo().then(updateLoanUrl);
                setTitle($('#' + to).data('title'));
                animateLeft('#' + from, '#' + to);
                orchestrator.transition_stack = [];
                orchestrator.transition_stack.push(["login", "main-menu"]);
                orchestrator.transition_stack.push(["main-menu", "own-stuff"]);
                orchestrator.transition_stack.push(["own-stuff", "receipt"]);
            },
            "friend-loan:receipt": function() {
                $('#receipt').show();
                orchestrator.transition_stack.pop();
            },

            "receipt:own-stuff": function(from, to) {
                ownStuffView.selectCollection('loans');
                setTitle($('#' + to).data('title'), 'title-left-in');
                animateRight('#' + from, '#' + to);
            },

            "*:logged-in": function(from, to) {
                $('#login-screen .error').hide();
                orchestrator.transition("main-menu");
                return false;
            },
            "settings:logged-out": function(from, to) {
                animateRight("#settings", "#login-screen");
                $('#top-bar').addClass('left-out');
                $('#top-bar').one('webkitAnimationEnd', function() {
                    $('#top-bar').removeClass('left-out').hide();
                    $('#' + from + ', .back').hide();
                });
                setTitle($('#main-menu').data('title'));
                this.reset();

                return false;
            },
            "settings:barcode": function() {
                userBarcodeView.render();

                animateLeft('#settings', '#barcode');
                setTitle($('#barcode').data('title'));
                $('#top-bar .marked-button').fadeOut();
                return false;
            },
            "main-menu:settings": function() {
                settingsView.changeSelectedMenuItem('user-info-content');
                settingsView.toggleSelected();
            },
            "barcode:settings": function() {
                animateRight('#barcode', '#settings');
                setTitle($('#settings').data('title'), 'title-left-in');
                $('#top-bar .marked-button').fadeIn();
                return false;
            },
            "*:barcode-confirm": function(from, to) {
                animateLeft("#" + from, "#barcode-confirm");
                setTitle($('#barcode-confirm').data('title'), 'title-right-in');
            },
            "barcode-confirm:friend-loan": function(from, to) {
                animateRight("#barcode-confirm", "#friend-loan");
                setTitle($('#friend-loan').data('title'), 'title-left-in');
            },
            "work:reserve-book": function() {
                animateLeft('#work', '#reserve-book');
                setTitle($('#reserve-book').data('title'), 'title-right-in');
                $('#top-bar .marked-button').fadeOut();
                return false;
            },
            "reserve-book:work": function() {
                animateRight('#reserve-book', '#work');
                setTitle($('#work').data('title'), 'title-right-in');
                $('#top-bar .marked-button').fadeIn();
                return false;
            }
        }),
        loginChanged = function(item) {
            console.log("login changed");
            if (item.get("first_name") === null) {
                orchestrator.transition("logged-out");
            } else {
                orchestrator.transition("logged-in");
                settingsView.model = window.CurrentUser;
                settingsView.render();
                settingsView.$el.hide();
                loginView.$el.find(':text,:password').val('');
                
                //Starting WakefulIntentService
                var params = [ window.CurrentUser.get("card_number"), window.CurrentUser.get("pin") ];
                console.log("Calling Notification plugin with " + params[0] + ", " + params[1]);
                /*window.plugins.notificationService.startservice(function(success){},
                		function(error){
                			alert("NotificationService error: " + error);
                }, params);*/
            }
        },
        workSelected = function(item) {
            if ($('#top-bar .marked-button').is('.edit-marked-ready-button')) {
                return;
            }

            workView.model = item;
            workView.render();
            setTitle(window.localization.messages.type(item.get("type"), item.get("extent")));
            orchestrator.transition("work");
        },
        receiveAjaxUrl = function(url) {
            var pos = ajaxRequests.lastIndexOf(url);
            if (pos >= 0) {
                ajaxRequests.splice(pos, 1);
            }
        },
        goBack = function() {
            ajaxRequests = [];
            $("#loader").removeClass("sent no-loader");
            $('#loader').fadeOut(150);
            window.clearTimeout(timeout);

            var current_state = orchestrator.current_state;
            orchestrator.back();

            if ($('#loader').hasClass('sent') && !$('#loader').hasClass('no-loader')) {
                _.defer(function() {
                    $('#' + current_state).trigger('webkitAnimationEnd');
                });
            }
        },
        animator,
        wrapperHeight;

    window.startAnimation = function(selector) {
        if (animator) { clearInterval(animator); }
        var n = 0, d = [1, 1, 1, -1, -1, -1], t = 0;

        animator = setInterval(function() {
            $(selector).html(window.localization.messages.fetching() + _.map(_.range(0, n), function() { return "."; }).join(''));
            n += d[t % d.length];
            t += 1;
        }, 250);
    };
    window.stopAnimation = function() {
        if (animator) { clearInterval(animator); }
    };

    _.each(views, function(view) {
        view.on("module:rendered", function() {
            if (window.iscroll) {
                _.defer(function() {
                    if (window.iscroll) {
                        window.iscroll.refresh();
                    }
                });
            }
        });
    });

    mainMenuView.on("item:selected", function(item) {
        orchestrator.transition(item);
    });

    orchestrator.on(function(from, to) {
        var $from = $('#' + from),
            $to = $('#' + to),
            height = wrapperHeight + 
                ((to === "receipt" || to === "work" || to === "marked" || to === "reserve-book") ? 44 : 0);

        if ($from && $from.data('scrollable') === true) {
            $('#wrapper').attr('id', null);
            if (window.iscroll) {
                window.iscroll.destroy();
                window.iscroll = null;
            }
        }

        if ($to && $to.data('scrollable') === true) {
            if (window.iscroll) {
                window.iscroll.refresh();
            } else {
                $to.find('.content-scroller').attr('id', 'wrapper').css('height', height);
                window.iscroll = new iScroll($to.find('.content-scroller').get(0), { scrollbarColor: 'rgba(0x32,0x32,0x32,0.5)', bounce: false });
            }
        }
    });

    window.CurrentUser.on("change", loginChanged);

    ownStuffView.on("work:selected", workSelected);
    libraryView.on("work:selected", workSelected);
    markedView.on("work:selected", workSelected);

    markedView.on("work:deleted", function(item) {
        var onConfirm = function (button) {
            if (button === true || button === window.localization.okButton) {
                window.MarkedWorkCollection.remove(item);
                window.MarkedWorkCollection.save();

                $('.marked li .delete').show();
            }

        };

        window.library.confirm(window.localization.messages.deleteWorkConfirmation(item), onConfirm, window.localization.messages.notificationTitle(), window.localization.messages.confirmButtonLabels());
    });


    window.CurrentUser.on("book:renew-all:started", function() {
        orchestrator.transition("receipt");
    });

    window.CurrentUser.on("book:renew-all:completed", function(items) {
        console.log("All books renewed. Rendering receipt view.");
        receiptView.model.set("items", new window.WorkCollection(_.values(items)));
    });

    window.CurrentUser.on("book:reserve:started", function(item) {
        $('#loader').fadeIn(150);
    });
    
    window.CurrentUser.on("book:reserve:complete", function(item) {
        window.GA.trackEventWithCategory("book", "reserved")
        window.library.alert(window.localization.messages.reservationComplete(), function() {
            $('#loader').fadeOut(150);
            orchestrator.back();
        });
    });

    window.CurrentUser.on("book:reserve:fail", function(item) {
        if (item.statusText !== 'timeout') {
            window.library.alert(window.localization.messages.reservationFailed(), function() {
                $('#reserve-book').show();
                $('#loader').fadeOut(150);
                orchestrator.back();
            });
        } else {
            $('#reserve-book').show();
            $('#loader').fadeOut(150);
            orchestrator.back();
        }
    });

    workView.on("book:renew:started", function() {
        orchestrator.transition("receipt");
    });

    workView.on("book:renew:completed", function(item) {
        window.GA.trackEventWithCategory("book", "renewed")
        console.log("Book renewal completed.");
        receiptView.model.set("items", new window.WorkCollection([item]));
    });

    workView.on("book:mark", function(item) {
        window.MarkedWorkCollection.add(item);
        window.MarkedWorkCollection.save();
    });

    workView.on("book:reserve", function(item) {
        reserveBookView.model = item;
        reserveBookView.render();
        orchestrator.transition("reserve-book");
    });

    reserveBookView.on("book:reserve:list-error", function(error) {
        window.library.alert(window.localization.messages.reservationFailed(), function() {
            orchestrator.back();
        });
    });

    friendLoanView.on("book:renew:started", function() {
        orchestrator.transition("receipt");
    });

    friendLoanView.on("book:renew:completed", function(item) {
        window.GA.trackEventWithCategory("book", "friend-loan")
        console.log("Friendloan completed. Rendering receipt");
        receiptView.model.set("items", new window.WorkCollection([item]));
    });

    friendLoanView.on("book:friendloan:unconfirmed", function(item) {
        barcodeConfirmView.render(true);
        $('#loader').fadeOut(150);
    });

    settingsView.on("barcode:show", function() {
        orchestrator.transition("barcode");
    });

    friendLoanView.on("barcode:read", function(book_id) {
        var workModel = new window.Work({barcode: book_id});
        barcodeConfirmView.model = workModel;
        barcodeConfirmView.fetchBookInfo();
        orchestrator.transition("barcode-confirm");
    });
    barcodeConfirmView.on("pin:correct", function(book_id) {
        friendLoanView.loanBook(null, book_id);
    });
    barcodeConfirmView.on("pin:wrong", function() {
        window.library.alert(window.localization.messages.pincodeWrong());
    });

    $("#loader")
        .bind("ajaxSend", function(e, j, jq) {
            ajaxRequests.push(jq.url);
            $(this).addClass("sent");
            if (!$(this).hasClass('no-loader')) {
                window.startAnimation("#loader p");
            }
        })
        .bind("ajaxComplete", function(e, j, jq) {
            receiveAjaxUrl(jq.url);
            if (ajaxRequests.length === 0) {
                $(this).removeClass("sent no-loader");
                $(this).trigger('loadComplete');
                window.stopAnimation();
            }
        })
        .bind("ajaxError", function(event, jqxhr, settings, reason) {
            if (settings.suppressErrors) {
                return;
            }
            if (reason === "timeout") {
                settings.suppressErrors = true;

                console.log("Timeouted url: " + settings.url);
                window.library.alert(window.localization.messages.timeout(), function() {
                    // If we got here, the error suppression must've been false, so reset it
                    settings.suppressErrors = false;
                });

                if (!orchestrator.isEmpty() && orchestrator.lastTransition()[1] !== "main-menu") {
                    orchestrator.back();
                }
            }
        });

    $('.back').click(function(e) {
        goBack();
    });

    $('#top-bar').delegate('.pin-button', 'click', function() {
        if (orchestrator.lastTransition()[0] === "marked") {
            orchestrator.back();
        } else {
            orchestrator.transition("marked");
        }
    }).delegate('.edit-marked-button', 'click', function() {
        var markedButton = $('#top-bar .marked-button');
        markedButton.removeClass("edit-marked-button");
        markedButton.addClass("edit-marked-ready-button");
        markedButton.html('<p><a class="edit-marked">' + window.localization.messages.finish() + '</a></p>');

        $('.marked li .delete').show();
    }).delegate('.edit-marked-ready-button', 'click', function() {
        var markedButton = $('#top-bar .marked-button');
        markedButton.removeClass("edit-marked-ready-button");
        markedButton.addClass("edit-marked-button");
        markedButton.html('<p><a class="edit-marked">' + window.localization.messages.modify() + '</a></p>');

        $('.marked li .delete').hide();
    });

    $('#search-bar .close').bind('click', function() {
        $('#library .menu .selected').click();
        return false;
    });

    $('#search-bar [type="search"]')
        .focusin(function() {
            $('#search-bar [type="reset"]').css('display', 'inline-block');
        });
    $('#search-bar [type="reset"]').click(function() {
        $(this).css('display', 'none');
    });

    loginView.render();
    $('#login-screen').show();
    $('#top-bar').hide();

    if (window.CurrentUser.get("card_number")) {
        loginChanged(window.CurrentUser);
    }

    var doResize = function() {
        var w = $(window).height(),
            t = $('#top-bar').height(),
            i = 25 + 40, // #loader p height
            r = w - t;

        wrapperHeight = w - 2 * t - 14;

        $('#loader')
            .height(r)
            .find('p')
                .css({ top: ($(window).height() - t - i) / 2 });
    };

    $(window).resize(doResize);

    $(function() {
        doResize();
    });
  
    // Override Android's backbutton
    document.addEventListener("deviceready", function() {
        window.library.alert = function(msg, cb) {
            if (cb === undefined) { cb = function() { }; }
            navigator.notification.alert(msg, cb, window.localization.messages.notificationTitle());
        };
        window.library.confirm = function() {
            navigator.notification.confirm.apply(this, arguments);
        };

        window.GA.trackerWithTrackingId("UA-000-1");
        window.GA.trackEventWithCategory("application", "started");

        document.addEventListener("backbutton", function() {
            if (orchestrator.lastTransition()[1] !== "main-menu") {
                if ($("body").hasClass("search-mode")) {
                    $("#search-bar .close").click();
                } else {
                    goBack();
                }
            } else {
                window.LainariActivity.closeCurrentActivity();
            }
        }, true);
        // A little thing called hack
        if (typeof device !== "undefined") {
            window.device_unique_id = device.uuid;
        }
        if (typeof device !== "undefined" && device.platform === "android") {
            $('#search-bar [type="reset"]').hide();
            $('#search-bar [type="search"]').unbind("focusin");

            // Set ok-button to 1 in Android
            window.localization.okButton = 1;
            window.localization.messages.confirmButtonLabels = function() { return "Jatka, Peruuta"; };
        } else {
            window.localization.okButton = 2;
            window.localization.messages.confirmButtonLabels = function() { return "Peruuta, Jatka"; };
        }

        // bind touch events to back and pin button
        var highlightItem = function(e) {
            $(this).addClass('selected');
        },
            unHighlightItem = function(e) {
                $(this).removeClass('selected');
            };
        $('.bar-button').bind("touchstart", highlightItem);
        $('.bar-button').bind("touchmove", unHighlightItem);
        $('.bar-button').bind("touchcancel", unHighlightItem);
        $('.bar-button').bind("touchend", unHighlightItem);

        FB.init({ appId: window.localization.fbAppId, nativeInterface: CDV.FB, useCachedDialogs: false });
    }, false);

    // export for pure profit
    window.orchestrator = orchestrator;
    window.updateLoanUrl = updateLoanUrl;

    window.library = {
        alert: function(msg, cb) { alert(msg); cb(); },
        confirm: function(msg, cb) { cb(confirm(msg)); }
    };
});
