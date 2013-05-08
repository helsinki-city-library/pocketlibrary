//////////////////////////
//
// Config
// Set your app id here.
//
//////////////////////////

//Add your Application ID here
var gAppID = 'enter_your_appid_here';

if (gAppID == 'enter_your_appid_here') {
  alert('You need to enter your App ID in js/_config.js on line 13.');
}

//Initialize the Facebook SDK
FB.init({ 
  appId: gAppID, 
  status: true,
  cookie: true,
  xfbml: true,
  frictionlessRequests: true,
  useCachedDialogs: true,
  oauth: true
});

//Init the plugin
/*if ((typeof Cordova == 'undefined') || (typeof cordova == 'undefined')) alert('Cordova variable does not exist. Check that you have included cordova.js correctly');
if (typeof CDV == 'undefined') alert('CDV variable does not exist. Check that you have included pg-plugin-fb-connect.js correctly');
if (typeof FB == 'undefined') alert('FB variable does not exist. Check that you have included the Facebook JS SDK file.');*/
  
document.addEventListener('deviceready', function() {
    try {
        //alert('Device is ready! Make sure you set your app_id below this alert.');
        FB.init({ appId: "enter_your_appid_here", nativeInterface: CDV.FB, useCachedDialogs: false });
    } catch (e) {
        alert(e);
    }
}, false);