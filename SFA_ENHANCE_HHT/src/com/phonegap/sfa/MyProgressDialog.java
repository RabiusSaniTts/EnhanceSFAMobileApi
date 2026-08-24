package com.phonegap.sfa;

import android.app.Dialog;
import android.content.Context;
import android.view.ViewGroup.LayoutParams;
import android.view.Window;
import android.widget.ProgressBar;

/**
 *  MyProgressDialog class is used to show progress bar with 
 *  transparent background using custom theme
 *  
 * @author 
 *
 */

public class MyProgressDialog extends Dialog {

	public MyProgressDialog(Context context) {
		super(context, R.style.Theme_CustomDialog);
		init();
	}

	

	// initialize progress dialog
	private void init() {

		super.requestWindowFeature(Window.FEATURE_NO_TITLE);
		//super.addContentView(new ProgressBar(getContext()), new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));
		super.setContentView(R.layout.dialog);
		super.setCancelable(false);
		super.show();
	}

	// initialize progress dialog with msg
	
	// dismiss progress dialog
	public void dismiss() {

		if (this != null && this.isShowing()) {
			super.dismiss();
		}
	}
}