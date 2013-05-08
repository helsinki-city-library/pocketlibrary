package com.taiste.plugin;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import com.google.analytics.tracking.android.EasyTracker;
import com.google.analytics.tracking.android.Tracker;

import android.util.Log;

public class GoogleAnalyticsPlugin extends CordovaPlugin {
	
	private static String INIT_TRACKER = "trackerWithTrackingId";
	private static String TRACK_VIEW = "trackView";
	private static String TRACK_EVENT = "trackEventWithCategory";
	
	private Tracker tracker;
	private EasyTracker easyTracker;
	
	public GoogleAnalyticsPlugin() {
		easyTracker = EasyTracker.getInstance();
	}
	
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		boolean ret = false;
		if (action.equals(INIT_TRACKER)) {
			setupTracker(args.getString(0));
			ret = true;
		} else if (action.equals(TRACK_VIEW)) {
			trackPageView(args.getString(0));
			ret = true;
		} else if (action.equals(TRACK_EVENT)) {
			String category = args.getString(0);
			String eventAction = args.getString(1);
			String label = getStringOrDefault(args, 2, "");
			Long value = getLongOrDefault(args, 3, -1L);
			trackEvent(category, eventAction, label, value);
			ret = true;
		}
		return ret;
	}
	
	private void setupTracker(String id) {
		easyTracker.activityStart(this.cordova.getActivity());
		tracker = EasyTracker.getTracker();
		Log.i("GoogleAnalytics", "Initializing tracker");
	}
	
	private void trackPageView(String pageURI) {
		if (tracker != null) {
			tracker.sendView(pageURI);
			Log.i("GoogleAnalytics", "Tracking pageview " + pageURI);
		} else {
			Log.e("GoogleAnalytics", "For some reason, tracker is null. Is trackerWithTrackingId called?");
		}
	}
	
	private void trackEvent(String category, String action, String label, long value) {
		if (tracker != null) {
			tracker.sendEvent(category, action, label, value);
			Log.i("GoogleAnalytics", "Tracking event " + category + ":" + action);
		} else {
			Log.e("GoogleAnalytics", "For some reason, tracker is null. Is trackerWithTrackingId called?");
		}
	}
	
	private static String getStringOrDefault(JSONArray arr, int index, String def) {
		try {
			return arr.getString(index);
		} catch (JSONException e) {
			return def;
		}
	}
	
	private static Long getLongOrDefault(JSONArray arr, int index, Long def) {
		try {
			return arr.getLong(index);
		} catch (JSONException e) {
			return def;
		}
		
	}

}
