package com.kifi.lainari.backgroundtasker;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.content.ContextWrapper;
import android.content.Intent;
import android.util.Log;

public class BackgroundTaskerPlugin extends Plugin {
	private static final String TAG = "BackgroundTaskerPlugin";
	private static final String CALL_SERVICE_ACTION = "callService";

	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		Log.i(TAG, "BakgroundTaskerPlugin Called");
		PluginResult result = null;

		if (CALL_SERVICE_ACTION.equals(action)) {
			try {
				String userNumber = data.getString(0);
				String userPin = data.getString(1);
				Log.d(TAG, CALL_SERVICE_ACTION + " : Sending " + data.toString() + " to service");
			} catch (JSONException jsonEx) {
				Log.d(TAG, "JSON Exception : "+ jsonEx.getMessage());
				result = new PluginResult(Status.JSON_EXCEPTION);
			}
		} else {
		    result = new PluginResult(Status.INVALID_ACTION);
		    Log.d(TAG, "Invalid action : " + action + " passed");
		}

		return result;
	}
}
