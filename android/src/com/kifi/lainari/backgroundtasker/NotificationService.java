package com.kifi.lainari.backgroundtasker;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpParams;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.util.Base64;
import android.util.Log;

public class NotificationService extends WakefulIntentService {
	public NotificationService() {
		super("NotificationService");
	}
	
	@Override
	protected void doWakefulWork(Intent intent) {
		Log.d("NotificationService : ", "Running NotificationService...");
		
		//Poll server for due dates
		JSONObject response;
		String patronUrl = "https://" +
				intent.getStringExtra("userNumber") + "/notifications";
		String authStr = intent.getStringExtra("userNumber") +
				":" + intent.getStringExtra("userPin");
		byte[] authEncBytes = Base64.encode(authStr.getBytes(), Base64.DEFAULT);
		String authStringEnc = new String(authEncBytes);
		
		response = getJSONFromUrl(patronUrl, authStringEnc);
		
		//Return response;
	}
	
	private JSONObject getJSONFromUrl(String url, String encAuthCreds) {
		InputStream is = null;
	    JSONObject jObj = null;
	    String json = null; 
		
        // Making HTTP request
        try {
        	HttpParams httpParams = new BasicHttpParams();
            DefaultHttpClient httpClient = new DefaultHttpClient(httpParams);
            HttpPost httpPost = new HttpPost(url);
            
            httpPost.addHeader("Authorization", "Basic " + encAuthCreds);
 
            HttpResponse httpResponse = httpClient.execute(httpPost);
            HttpEntity httpEntity = httpResponse.getEntity();
            is = httpEntity.getContent();
 
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
 
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(
                    is, "iso-8859-1"), 8);
            StringBuilder sb = new StringBuilder();
            String line = null;
            while ((line = reader.readLine()) != null) {
                sb.append(line + "n");
            }
            is.close();
            json = sb.toString();
            Log.e("JSON", json);
        } catch (Exception e) {
            Log.e("Buffer Error", "Error converting result " + e.toString());
        }
 
        // try parse the string to a JSON object
        try {
            jObj = new JSONObject(json);
        } catch (JSONException e) {
            Log.e("JSON Parser", "Error parsing data " + e.toString());
        }
 
        // return JSON String
        return jObj;
    }
}