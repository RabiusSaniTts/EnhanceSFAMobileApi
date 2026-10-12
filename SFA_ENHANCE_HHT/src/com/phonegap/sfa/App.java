package com.phonegap.sfa;

import org.apache.cordova.DroidGap;

import android.Manifest;
import android.annotation.TargetApi;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Toast;

@TargetApi(23)
public class App extends DroidGap {
    Intent myGpsService;
    final String GPS_FILTER = "MyGPSLocation";
    private static final int REQUEST_CODE_PERMISSIONS = 101;

    // Permissions you need
    private static final String[] REQUIRED_PERMISSIONS = new String[]{
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS,
            Manifest.permission.READ_CONTACTS,
            Manifest.permission.WRITE_CONTACTS,
           
            
    };

   
    @Override
    @TargetApi(Build.VERSION_CODES.M)
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fullscreen setup
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        // Check and request permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!hasAllPermissions()) {
                requestPermissions(REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS);
            } else {
                loadCordovaApp();
            }
        } else {
            loadCordovaApp(); // No runtime permission needed pre-Marshmallow
        }
    }

    private boolean hasAllPermissions() {
        for (String permission : REQUIRED_PERMISSIONS) {
            if (checkSelfPermission(permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    private void loadCordovaApp() {
        super.setIntegerProperty("loadUrlTimeoutValue", 25000);
        super.setIntegerProperty("splashscreen", R.drawable.vansalesenhance);
        //initGpsListeners();
        super.loadUrl("file:///android_asset/www/index.html", 3000);
        // Resume tracking only when an unclosed route already exists.
        LocationUpdateService.reconcileWithRouteState(getApplicationContext());
    }

    private void initGpsListeners() {
        myGpsService = new Intent(this, LocationUpdateService.class);
        startService(myGpsService);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (allGranted) {
                Toast.makeText(this, "All permissions granted", Toast.LENGTH_SHORT).show();
                loadCordovaApp();
            } else {
                Toast.makeText(this, "Permissions denied. App cannot continue.", Toast.LENGTH_LONG).show();
                finish(); // Exit or handle fallback
            }
        }
    }
}
