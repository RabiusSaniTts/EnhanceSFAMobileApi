package com.phonegap.sfa;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import com.itextpdf.text.pdf.codec.Base64.OutputStream;

import android.util.Log;

public class HttpConnection {
	public String readUrl(String mapsApiDirectionsUrl) throws IOException {
		String data = "";
		InputStream iStream = null;
		HttpURLConnection urlConnection = null;
		try {
			URL url = new URL(mapsApiDirectionsUrl);
			urlConnection = (HttpURLConnection) url.openConnection();
			urlConnection.connect();
			iStream = urlConnection.getInputStream();
			BufferedReader br = new BufferedReader(new InputStreamReader(
					iStream));
			StringBuffer sb = new StringBuffer();
			String line = "";
			while ((line = br.readLine()) != null) {
				sb.append(line);
			}
			data = sb.toString();
			br.close();
		} catch (Exception e) {
			Log.d("Exception while reading url", e.toString());
		} finally {
			iStream.close();
			urlConnection.disconnect();
		}
		return data;
	}
	
	
	public String postJson(String urlString, String jsonData) throws IOException {
	    URL url = new URL(urlString);
	    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
	    conn.setRequestMethod("POST");
	    conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
	    conn.setRequestProperty("Accept", "application/json");
	    conn.setConnectTimeout(15000);
	    conn.setReadTimeout(30000);
	    conn.setDoOutput(true);

	    java.io.OutputStream os = null;
	    try {
	        os = conn.getOutputStream();
	        os.write(jsonData.getBytes("UTF-8"));
	    } finally {
	        if (os != null) {
	            try { os.close(); } catch (IOException ignored) {}
	        }
	    }


	    int responseCode = conn.getResponseCode();
	    if (responseCode >= 200 && responseCode < 300) {
	        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
	        StringBuilder response = new StringBuilder();
	        String line;
	        while ((line = in.readLine()) != null) {
	            response.append(line);
	        }
	        in.close();
	        return response.toString();
	    } else {
	        throw new IOException("Server returned non-OK status: " + responseCode);
	    }
	}


}
