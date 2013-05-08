package com.taiste.lainari_en;

import com.taiste.lainari_en.R;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.Window;

public class SplashScreen extends Activity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.splash);
        new showLainari().execute();
    }
    
    private class showLainari extends AsyncTask<Void, Void, Void> {

		@Override
		protected Void doInBackground(Void... params) {
	    	try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {}

	        Intent main = new Intent(getBaseContext(), Lainari.class);
	        startActivity(main);
			return null;
		}
    	
    
    }
}

