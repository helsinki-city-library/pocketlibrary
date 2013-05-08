if (!window.GA) {
	window.GA = {
		trackerWithTrackingId: function(id) {
			cordova.exec(null, null, "GoogleAnalyticsPlugin", "trackerWithTrackingId", [id]);
			//console.log("trackerWithTrackingId Initialized");
		},
		trackView: function(pageUri) {
			cordova.exec(null, null, "GoogleAnalyticsPlugin", "trackView", [pageUri]);
			//console.log("trackView Initialized");
		},
		trackEventWithCategory: function(category,action,label,value) {
            //console.log("Tracking event");
            var options= [category, action, label, value];
			cordova.exec(null, null, "GoogleAnalyticsPlugin", "trackEventWithCategory",options);
		},
		hitDispatched: function(hitString) {
			//console.log("hitDispatched :: " + hitString);
		},
		trackerDispatchDidComplete: function(count) {
			//console.log("trackerDispatchDidComplete :: " + count);
		}
	}
}
