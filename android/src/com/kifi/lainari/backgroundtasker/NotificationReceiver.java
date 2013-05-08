package com.kifi.lainari.backgroundtasker;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotificationReceiver extends BroadcastReceiver {

	@Override
	public void onReceive(Context ctx, Intent intent) {
	    WakefulIntentService.acquireStaticLock(ctx);
		ctx.startService(new Intent(ctx, NotificationService.class));
	}
}