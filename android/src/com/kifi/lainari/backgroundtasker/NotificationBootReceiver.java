package com.kifi.lainari.backgroundtasker;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;

public class NotificationBootReceiver extends BroadcastReceiver {
	private static final int PERIOD = 10000; //86400000;  one day
	
	@Override
	public void onReceive(Context ctx, Intent intent) {
		AlarmManager alarmMgr = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
	    Intent i = new Intent(ctx, NotificationReceiver.class);
	    PendingIntent pi = PendingIntent.getBroadcast(ctx, 0, i, 0);
	    
	    alarmMgr.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
	                      SystemClock.elapsedRealtime()+60000,
	                      PERIOD,
	                      pi);
	}
}