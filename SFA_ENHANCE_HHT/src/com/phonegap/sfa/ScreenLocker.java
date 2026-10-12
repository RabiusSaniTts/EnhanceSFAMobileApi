package com.phonegap.sfa;

import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import org.json.JSONObject;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.KeyguardManager;
import android.app.KeyguardManager.KeyguardLock;
import android.app.admin.DevicePolicyManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import android.os.SystemClock;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;




public class ScreenLocker extends org.apache.cordova.api.Plugin {
	private JSONObject status;
	public static final String PARAM_GEO="latlong";
	private String callbackId = "";
	private JSONArray jRoutes;
	  public static final String TAG = "ScreenLocker";
	    public static final String ACTION_UNLOCK = "unlock";
	    public static final String ACTION_LOCK = "lock";
		private static final String KEYGUARD_SERVICE = null;
	    public static PowerManager powerManager;
	    public static PowerManager.WakeLock wakeLock;
	    DevicePolicyManager deviceManger;  
	     ActivityManager activityManager;  
	     ComponentName compName;
	     private PowerManager mPowerManager;
	     private PowerManager.WakeLock mWakeLock;
	     private BroadcastReceiver mReceiver;
	     private boolean  mScreenOn = true;
	     private Activity     mActivity;
	     private static final String TAG1 = ScreenLocker.class.getSimpleName();
		@SuppressWarnings("deprecation")
		@Override
		 public PluginResult execute(final String action, JSONArray arg1, String arg2) {
			
			// TODO Auto-generated method stub
			PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
			//result.setKeepCallback(true);
			
		        Log.v(TAG, "ScreenLocker received:" + action);
		        try {
		        	 if (ACTION_LOCK.equals(action)) {
		        		 
		        		// cordova.getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
		        		 // result = new PluginResult(PluginResult.Status.OK);
		        		
		        		 
		        		/* powerManager = (PowerManager) cordova.getActivity().getSystemService(Context.POWER_SERVICE);
		        	        wakeLock = powerManager.newWakeLock((PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE), "TAG");

		        	        Log.v(TAG, "Init ScreenLocker");*/
		        		
		        		 
		        		  Log.v("ProximityActivity", "OFF!");
		        		  
		        		  Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
		        		  Uri uri = Uri.parse(Environment.getExternalStorageDirectory()+"/OrderExcel"); //filename is string with value 46_1244625499.gif
		        		                 intent.setDataAndType(uri, "*/*");
		        		                 startActivity(Intent.createChooser(intent, "Open folder"));
		        		  
		        		  PowerManager pm = (PowerManager) cordova.getActivity().getSystemService(Context.POWER_SERVICE);
		        		  
		        		  long amountOfTime = 10;
						//pm.goToSleep( amountOfTime);
		        		  
		        		  PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "My Tag");
		        		  wl.acquire();
		        	     
		        		  
		        	        
		        		 // pm.goToSleep(SystemClock.uptimeMillis());
		        		  Log.d(TAG, "Screen Locked");
		        		
		        		 cordova.getActivity().runOnUiThread(new Runnable() {

		        			 protected PowerManager.WakeLock mWakeLock;

							public void run() {
								// TODO Auto-generated method stub
								
								 //cordova.getActivity(). getWindow().addFlags(WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON);
								// cordova.getActivity(). getWindow().clearFlags(WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON);
								// cordova.getActivity(). getWindow().setFlags(WindowManager.LayoutParams.Flag, 
							       	//	 WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON);
								/* WindowManager.LayoutParams params =cordova.getActivity(). getWindow().getAttributes();
				        		    params.flags = WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON;
				        		    params.screenBrightness = 0;
				        		    cordova.getActivity().getWindow().setAttributes(params);
								         
								
								final PowerManager pm = (PowerManager)cordova.getActivity(). getSystemService(Context.POWER_SERVICE);
						        this.mWakeLock = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK, "My Tag");
						        this.mWakeLock.acquire();
								 PluginResult result = new PluginResult(PluginResult.Status.OK);*/
							}
		        			 
		        		 });
		        		 //result = true;
		        	 }else if (ACTION_UNLOCK.equals(action)) {
			                Log.v(TAG, "ScreenLocker received ACTION_UNLOCK");
			                JSONObject arg_object = arg1.getJSONObject(0);
			              //  final int  acquireTime = arg_object.getInt("timeout");
			                //final int  acquireTime = 10; 
			                final int  acquireTime = arg_object.getInt("timeout");
			           
			                
			               
			              cordova.getActivity().runOnUiThread(new Runnable() {

								public void run() {
									// TODO Auto-generated method stub
									Window window = cordova.getActivity().getWindow();
			                    	window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED);
			                    	window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
			                    	window.addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

			                       /* if(wakeLock.isHeld()) {
			                            wakeLock.release();
			                        }*/
			                        if(acquireTime > 0) {
			                            wakeLock.acquire(acquireTime);
			                        }
			                        else
			                        {
			                            wakeLock.acquire();
			                        }
			                        Log.v(TAG, "ScreenLocker received SUCCESS:" + action);
			                      //  callbackContext.success();
								}
			                	
			                });
			               
			                
			            } else {
			            	 Log.v(TAG, "Invalid Action:");
			                //result = false;
			            }
		        	  
		        	  
		        }catch (Exception e) {
		            System.err.println("Exception: " + e.getMessage());
		           // callbackContext.error(e.getMessage());
		            //result = false;
		        }
		        Log.v(TAG, "ScreenLocker received SUCCESS:" + result);
		        return result;
		       
		       
		}
		private void startActivity(Intent createChooser) {
			// TODO Auto-generated method stub
			
		}
		

		
	
	
	
}
