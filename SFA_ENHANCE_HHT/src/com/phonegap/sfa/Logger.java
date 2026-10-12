package com.phonegap.sfa;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import android.os.Environment;

public class Logger {
	private boolean isAppenlog=true;

public void appendLog(String text)
    {
	if(isAppenlog)
	{
       File dir = new File(Environment.getExternalStorageDirectory()
				+ "/sfa/");
	
       if(!dir.exists())
       {
           dir.mkdirs();
       }
       Date now = new Date();
       String nowAsString = new SimpleDateFormat("yyyy-MM-dd").format(now);
       File logFile = new File(Environment.getExternalStorageDirectory()
				+ "/sfa/sfa_log_+"+nowAsString+".txt");

       if (!logFile.exists())
       {
          try
          {
             logFile.createNewFile();
          } 
          catch (IOException e)
          {
             // TODO Auto-generated catch block
        	 e.printStackTrace();

          }
       }
       try
       {
          //BufferedWriter for performance, true to set append to file flag

          BufferedWriter buf = new BufferedWriter(new FileWriter(logFile, true)); 
          
          buf.append(new Date().toString()+"\n");

          buf.append(text);

          buf.newLine();

          buf.close();

       }
       catch (IOException e)
       {
          // TODO Auto-generated catch block

           e.printStackTrace();

       }
    }
   }
}
