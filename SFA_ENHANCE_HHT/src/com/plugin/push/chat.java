package com.plugin.push;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;

import org.apache.cordova.DroidGap;
import org.json.JSONException;
import org.json.JSONObject;

import com.phonegap.sfa.R;
import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.Settings.Secure;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

@SuppressLint("NewApi")
public class chat extends DroidGap {
	
	 TextView notifymsg,btnBack,salesmsg;
	 EditText  messtxt;
     String deviceid="";
     String InputMessage="";
     final Context context = this;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

      //  super.loadUrl("file:///android_asset/www/notification.html");
        
		setContentView(R.layout.chat);
		notifymsg=(TextView)findViewById(R.id.textMsg);
		salesmsg = (TextView)findViewById(R.id.salesMsg);
		btnBack = (TextView)findViewById(R.id.btnBack);
	    messtxt = (EditText)findViewById(R.id.textInput);
	 	final Button sendMess = (Button) findViewById(R.id.btnSend);
	 	
	 	notifymsg.setTextColor(Color.parseColor("#200e68"));
	 	notifymsg.setTypeface(notifymsg.getTypeface(), Typeface.BOLD_ITALIC);
	 	salesmsg.setTextColor(Color.parseColor("#19aa9c"));
	 	salesmsg.setTypeface(salesmsg.getTypeface(), Typeface.BOLD_ITALIC);

		Bundle extras = getIntent().getExtras();
		String pushmess = extras.getString("message");
		Log.e(TAG, "NOtification Message" + pushmess);
		if(pushmess != null)
		{
			notifymsg.setText("Admin :  "  +pushmess);
		}
		
		  sendMess.setOnClickListener(new View.OnClickListener() {
		        @Override
		        public void onClick(View view) {
		            // Take action.
		        	
		           InputMessage = messtxt.getText().toString();
		        	Log.v(TAG, "Input Text" + InputMessage);
		        	OutputStream os = null;
		            InputStream is = null;
		          //  HttpURLConnection conn = null;
		            
		        	JSONObject jsonObject = new JSONObject();
		        	deviceid = Secure.getString(getContentResolver(), Secure.ANDROID_ID);
		        	 try {
		        			jsonObject.put("comment", InputMessage);

		        		UpdateCommentTask updateCommentTask = new UpdateCommentTask();
		        		updateCommentTask.execute( InputMessage,deviceid);
		        		Bundle extras = getIntent().getExtras();
		        		String pushmess = extras.getString("message");
		        		notifymsg.setText("ADMIN :  "  +pushmess);
		        		
		        		salesmsg.setText("SALES OFFICER :  "  +messtxt.getText().toString());
		        		//messtxt.clearFocus();
		        		 messtxt.setText("");
		        		 Toast.makeText(getApplicationContext(), "Message Sent Successfully..", Toast.LENGTH_LONG).show();
		
					} catch (JSONException e) {
						e.printStackTrace();
					} 
		        }
		    });

		  btnBack.setOnClickListener(new View.OnClickListener() {
		        @Override
		        public void onClick(View view) {
		        	finish();
		        }
		    });
    }
}

class UpdateCommentTask extends AsyncTask<String, Void, String> {

	private static final String TAG = null;
    private Context mContext;
	protected String doInBackground(String... params) {
		

	
		// String urlString = "http://wjtts.dyndns.org:8095/sfa/sfa_mazoon/api/ws/getcomment/comment/"+params[0]+"/deviceid/"+params[1]; // URL to call
		
		// String urlString = "http://85.154.22.126:8095/sfa/sfa_uat/api/ws/getcomment/comment/"+params[0]+"/deviceid/"+params[1]; // MDC SERVER
		 String urlString = "http://85.154.22.126:8095/sfa/sfa_mazoon/api/ws/getcomment/comment/"+params[0]+"/deviceid/"+params[1]; // MDC SERVER
		
        String data = params[0] +","+ params[1]; //data to post
        
         OutputStream out = null;
     

	  String inputMessage = "";
	  String response = "";
		 URL url;
		 try {
			 if( params[0].length()>0)
			 {
		        url = new URL(urlString);

		        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		        conn.setReadTimeout(15000);
		        conn.setConnectTimeout(15000);
		        conn.setRequestMethod("POST");
		        conn.setDoInput(true);
		        conn.setDoOutput(true);


		        OutputStream os = conn.getOutputStream();
		        BufferedWriter writer = new BufferedWriter(
		                new OutputStreamWriter(os, "UTF-8"));
		        writer.write(data);

		        writer.flush();
		        writer.close();
		        os.close();
		        int responseCode=conn.getResponseCode();

		        if (responseCode == HttpsURLConnection.HTTP_OK) {
		            String line;
		            BufferedReader br=new BufferedReader(new InputStreamReader(conn.getInputStream()));
		            while ((line=br.readLine()) != null) {
		                response+=line;
		            }
		        }
		        else {
		            response="";    

		        }
			 }
		    } catch (Exception e) {
		        e.printStackTrace();
		    }

		return inputMessage;
		
	}
	@Override
	protected void onPostExecute(String result) {
		super.onPostExecute(result);
	}
	

	private static String convertInputStreamToString(InputStream inputStream) throws IOException {
		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
		String line = "";
		String result = "";
		while ((line = bufferedReader.readLine()) != null)
			result += line;

		inputStream.close();
		return result;

	}


}

