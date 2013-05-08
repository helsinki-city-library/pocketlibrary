package com.taiste.lainari_en;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class Lainari extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
        
    }
    
    public void init() {
    	super.init();
    	this.appView.getSettings().setNavDump(false);
        this.appView.addJavascriptInterface(this, "LainariActivity");
    }
    
    public void closeCurrentActivity() {
    	this.finish();
    }
}

