//////////////////////////
//
// Authentication
// See "Logging the user in" on https://developers.facebook.com/mobile
//
//////////////////////////

var user = [];

//Detect when Facebook tells us that the user's session has been returned
document.addEventListener("deviceready", function() {
    console.log("Adding status change listener");
    FB.Event.monitor('auth.statusChange', function(session) {
        console.log('Got the user\'s session: ', session);

        if (session && session.status != 'not_authorized' && session.status != 'notConnected') {
            console.log(session.status);
            if (session.authResponse['accessToken']) {
                //Fetch user's id, name, and picture
                FB.api('/me', {
                    fields: 'name, picture'
                },
                function(response) {
                    if (!response.error) {
                        user = response;
                    }

                });
            }
        }
        else if (session === undefined) {
            console.log("No session available");
        }
        else if (session && (session.status == 'not_authorized' || session.status == 'notConnected')) {
            console.log("Not authorized");
        }
    });
});

//Prompt the user to login and ask for the 'email' permission
function promptLogin() {
    FB.login(null, {scope: 'email'});
}

//This will prompt the user to grant you acess to their Facebook Likes
function promptExtendedPermissions() {
    FB.login(function() {
        setAction("The 'user_likes' permission has been granted.", false);

        setTimeout('clearAction();', 2000);
    }, {scope: 'user_likes'});
}

//See https://developers.facebook.com/docs/reference/rest/auth.revokeAuthorization/
function uninstallApp() {
    FB.api({method: 'auth.revokeAuthorization'},
            function(response) {
                window.location.reload();
            });
}

//See https://developers.facebook.com/docs/reference/javascript/FB.logout/
function logout() {
    FB.logout(function(response) {
        window.location.reload();
    });
}
