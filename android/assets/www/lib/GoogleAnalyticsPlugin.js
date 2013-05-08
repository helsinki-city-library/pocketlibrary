if (!window.GA) {
	window.GA = {
		trackerWithTrackingId: function(id) {
			Cordova.exec("GoogleAnalyticsPlugin.trackerWithTrackingId",id);
			//console.log("trackerWithTrackingId Initialized");
		},
		trackView: function(pageUri) {
			Cordova.exec("GoogleAnalyticsPlugin.trackView",pageUri);
			//console.log("trackView Initialized");
		},
		trackEventWithCategory: function(category,action,label,value) {
			var options = {category:category,
				action:action,
				label:label,
				value:value};
			Cordova.exec("GoogleAnalyticsPlugin.trackEventWithCategory",options);
		},
		hitDispatched: function(hitString) {
			//console.log("hitDispatched :: " + hitString);
		},
		trackerDispatchDidComplete: function(count) {
			//console.log("trackerDispatchDidComplete :: " + count);
		}
	}
}
