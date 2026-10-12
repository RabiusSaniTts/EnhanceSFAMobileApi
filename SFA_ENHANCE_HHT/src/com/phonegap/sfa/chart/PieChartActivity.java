
package com.phonegap.sfa.chart;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import com.github.mikephil.charting.charts.HorizontalBarChart;
import com.github.mikephil.charting.charts.PieChart;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.utils.ColorTemplate;
import com.github.mikephil.charting.utils.Legend;
import com.github.mikephil.charting.utils.XLabels;
import com.github.mikephil.charting.utils.YLabels;
import com.github.mikephil.charting.utils.Legend.LegendPosition;
import com.github.mikephil.charting.utils.XLabels.XLabelPosition;
import com.github.mikephil.charting.utils.YLabels.YLabelPosition;
import com.phonegap.sfa.ChartHelper;
import com.phonegap.sfa.MapHelper;
import com.phonegap.sfa.R;

public class PieChartActivity extends DemoBase implements OnClickListener  {

    private PieChart mChart;
    private HorizontalBarChart mHChart;
	private JSONArray jRoutes;
	private int TotalCalls=0,PlannedCalls=0,UnplannedCalls=0,InvoicedCalls=0,ActualCalls=0;
	private int totalCount=0,productiveCount=0,unProductiveCount=0,remainingCount=0;;
	private int target=0,actual=0,balance=0;
	ArrayList<Integer> pieArray=new ArrayList<Integer>();
	ArrayList<Integer> pieArraySTrike=new ArrayList<Integer>();
	private TextView btnBack;
    @Override 
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
       
        setContentView(R.layout.activity_piechart);
    	mHChart = (HorizontalBarChart) findViewById(R.id.barchart);
        btnBack = (TextView) findViewById(R.id.btnBack);
        btnBack.setOnClickListener(this);
        Bundle b = getIntent().getExtras();
		if (b != null && b.containsKey((ChartHelper.PARAM_CHART))) {
			Log.d("Array", "" + b.getString(ChartHelper.PARAM_CHART));
			try {

				JSONArray jArray = new JSONArray(
						b.getString(ChartHelper.PARAM_CHART));

				
				
				JSONObject jData=jArray.getJSONObject(0);
				if(jData.has("type") && jData.getString("type").equals("0"))
				{
						mHChart.setVisibility(View.GONE);
						TotalCalls=jData.getInt("TotalCalls");
						PlannedCalls=jData.getInt("CallsMadePlanned");
						UnplannedCalls=jData.getInt("CallsMadeUnPlanned");
						InvoicedCalls=jData.getInt("InvoicedCalls");
						ActualCalls=jData.getInt("ActualCallsMade");
						totalCount=TotalCalls+UnplannedCalls;
						productiveCount=InvoicedCalls;
						unProductiveCount=ActualCalls-InvoicedCalls;
						remainingCount=totalCount-productiveCount-unProductiveCount;
						pieArray.add(remainingCount);
						pieArray.add(productiveCount);
						pieArray.add(unProductiveCount);
						pieArraySTrike.add(TotalCalls-PlannedCalls);
						pieArraySTrike.add(PlannedCalls);
						showChart(0);
						showChartStrikeRate(1,totalCount);
				}else{
					((PieChart) findViewById(R.id.chart1)).setVisibility(View.GONE);
					((TextView) findViewById(R.id.txtTitle)).setText("Target/Goals");
					target=jData.getInt("Target");
					actual=jData.getInt("Actual");
					balance=jData.getInt("Balance");
					pieArraySTrike.add(balance);
					pieArraySTrike.add(actual);
					pieArray.add(target);
					pieArray.add(actual);
					pieArray.add(balance);
					showChartStrikeRate(2,target);
					setBarChart(target);
					Log.e("Count",""+pieArraySTrike.get(0));
					Log.e("Count",""+pieArraySTrike.get(1));
					
				}
				
			} catch (JSONException e) {
				e.printStackTrace();
			}

		} else {
			finish();
		}
       

    }

  
    private void showChart(int type){
    	
    	 mChart = (PieChart) findViewById(R.id.chart1);

         // change the color of the center-hole
         mChart.setHoleColor(Color.rgb(235, 235, 235));
         
         Typeface tf = Typeface.createFromAsset(getAssets(), "OpenSans-Regular.ttf");

         mChart.setValueTypeface(tf);
         mChart.setCenterTextTypeface(Typeface.createFromAsset(getAssets(), "OpenSans-Light.ttf"));
         mChart.setValueTextColor(Color.BLACK);
         mChart.setHoleRadius(60f);

         mChart.setDescription("");

         mChart.setDrawYValues(true);
         mChart.setDrawCenterText(true);

         mChart.setDrawHoleEnabled(true);
       
         mChart.setRotationAngle(0);

         // draws the corresponding description value into the slice
         mChart.setDrawXValues(false);
         
         // enable rotation of the chart by touch
         mChart.setRotationEnabled(false);
         
         // display percentage values
         mChart.setUsePercentValues(true);
         // mChart.setUnit(" €");
         // mChart.setDrawUnitsInChart(true);

         mChart.setCenterText("PRODUCTIVITY");
    	
    	 setData(2, 100,pieArray,type);

    	 mChart.animateXY(1500, 1500);
         //mChart.spin(2000, 0, 360);
        
         Legend l = mChart.getLegend();
         l.setPosition(LegendPosition.RIGHT_OF_CHART);
         l.setXEntrySpace(7f);
         l.setYEntrySpace(5f);
    	
    	
    	
    }
    private void showChartStrikeRate(int type,int target){
    	
   	    mChart = (PieChart) findViewById(R.id.chart2);

        // change the color of the center-hole
        mChart.setHoleColor(Color.rgb(235, 235, 235));
        
        Typeface tf = Typeface.createFromAsset(getAssets(), "OpenSans-Regular.ttf");

        mChart.setValueTypeface(tf);
        mChart.setValueTextColor(Color.BLACK);
        mChart.setCenterTextTypeface(Typeface.createFromAsset(getAssets(), "OpenSans-Light.ttf"));

        mChart.setHoleRadius(60f);

        mChart.setDescription("");

        mChart.setDrawYValues(true);
        mChart.setDrawCenterText(true);

        mChart.setDrawHoleEnabled(true);
      
        mChart.setRotationAngle(0);

        // draws the corresponding description value into the slice
        mChart.setDrawXValues(false);
        
        // enable rotation of the chart by touch
        mChart.setRotationEnabled(false);
        
        // display percentage values
        mChart.setUsePercentValues(true);
        // mChart.setUnit(" €");
        // mChart.setDrawUnitsInChart(true);
        if(type==2){
        	   mChart.setDrawXValues(true);
        	 mChart.setCenterText("Target:"+target);
        }else{
        	 mChart.setCenterText("STRIKE RATE");
        }
       
   	
   	    setData(1, target,pieArraySTrike,type);

   	    mChart.animateXY(1500, 1500);
        //mChart.spin(2000, 0, 360);
       
        Legend l = mChart.getLegend();
        l.setPosition(LegendPosition.RIGHT_OF_CHART);
        l.setXEntrySpace(7f);
        l.setYEntrySpace(5f);
   	
   	
   	
   }
    
    private void setBarChart(int target){
    	
    
    	mHChart.setDrawBarShadow(false);
    	// enable the drawing of values
    	mHChart.setDrawYValues(true);
         
    	mHChart.setDrawValueAboveBar(true);

    	mHChart.setDescription("");

         // if more than 60 entries are displayed in the chart, no values will be
         // drawn
    	mHChart.setMaxVisibleValueCount(60);

         // disable 3D
    	mHChart.set3DEnabled(true);

         // scaling can now only be done on x- and y-axis separately
    	mHChart.setPinchZoom(false);

         // draw shadows for each bar that show the maximum value
         // mChart.setDrawBarShadow(true);

    	 mHChart.setUnit(" €");
         
         // mChart.setDrawXLabels(false);

    	 mHChart.setDrawGridBackground(true);
    	 mHChart.setDrawHorizontalGrid(false);
    	 mHChart.setDrawVerticalGrid(true);
         // mChart.setDrawYLabels(false);

         // sets the text size of the values inside the chart
    	 mHChart.setValueTextSize(10f);

         mHChart.setDrawBorder(true);
         // mChart.setBorderPositions(new BorderPosition[] {BorderPosition.LEFT,
         // BorderPosition.RIGHT});

         Typeface tf = Typeface.createFromAsset(getAssets(), "OpenSans-Regular.ttf");

         XLabels xl = mHChart.getXLabels();
         xl.setPosition(XLabelPosition.BOTTOM);
         xl.setCenterXLabelText(true);
         xl.setTypeface(tf);

         YLabels yl = mHChart.getYLabels();
         yl.setTypeface(tf);
         yl.setLabelCount(8);
         yl.setPosition(YLabelPosition.BOTH_SIDED);

         mHChart.setValueTypeface(tf);

         setBarData(3, target);

         Legend l = mHChart.getLegend();
         l.setPosition(LegendPosition.BELOW_CHART_LEFT);
         l.setFormSize(8f);
         l.setXEntrySpace(4f);
    	
    }
    private void setBarData(int count,int range){
    	
    	 ArrayList<String> xVals = new ArrayList<String>();
         for (int i = 0; i < count; i++) {
             xVals.add(mPGoalsBar[i]);
         }

         ArrayList<BarEntry> yVals1 = new ArrayList<BarEntry>();

         for (int i = 0; i < count; i++) {
           
             float val = (float) (pieArray.get(i));
             yVals1.add(new BarEntry(val, i));
         }

         BarDataSet set1 = new BarDataSet(yVals1, "DataSet");
         set1.setBarSpacePercent(5f);

         ArrayList<BarDataSet> dataSets = new ArrayList<BarDataSet>();
         ArrayList<Integer> colors = new ArrayList<Integer>();
         colors.add(Color.rgb(204, 0, 0));
         colors.add(Color.rgb(76, 153, 0));
         colors.add(Color.rgb(245, 199, 0));	 
        // colors.add(ColorTemplate.getHoloBlue());
         set1.setColors(colors);
         dataSets.add(set1);

         BarData data = new BarData(xVals, dataSets);

         mHChart.setData(data);
    	
    }
   private void setData(int count, float range,ArrayList<Integer> piearr,int type) {

        float mult = range;

        ArrayList<Entry> yVals1 = new ArrayList<Entry>();

        // IMPORTANT: In a PieChart, no values (Entry) should have the same
        // xIndex (even if from different DataSets), since no values can be
        // drawn above each other.
        for (int i = 0; i < count + 1; i++) {
        	if(piearr.get(i)==0)
            yVals1.add(new Entry(0, i));
        	else{
        		yVals1.add(new Entry((float) ((piearr.get(i) * 100) / mult), i));
        	}
        	//yVals1.add(new Entry((float) (piearr.get(i) * mult) + mult / 5, i));
        }

        ArrayList<String> xVals = new ArrayList<String>();

        for (int i = 0; i < count + 1; i++){
        		if(type==0)
        			xVals.add(mParties[i % mParties.length]);
        		else if(type==1)
        			xVals.add(mPStrike[i % mPStrike.length]);
        		else if(type==2)
        			xVals.add(mPGoals[i % mPGoals.length]);
        }
           
        

        PieDataSet set1 = new PieDataSet(yVals1, "");
        set1.setSliceSpace(5f);
       
        // add a lot of colors

       ArrayList<Integer> colors = new ArrayList<Integer>();
//
//        for (int c : ColorTemplate.VORDIPLOM_COLORS)
//            colors.add(c);
//
//        for (int c : ColorTemplate.JOYFUL_COLORS)
//            colors.add(c);
//
// c       for (int c : ColorTemplate.COLORFUL_COLORS)
//            colors.add(c);
//
// l       for (int c : ColorTemplate.LIBERTY_COLORS)
//            colors.add(c);
//        
//        for (int c : ColorTemplate.PASTEL_COLORS)
//            colors.add(c);
        colors.add(Color.rgb(204, 0, 0));
        colors.add(Color.rgb(76, 153, 0));
        colors.add(Color.rgb(245, 199, 0));	 
       // colors.add(ColorTemplate.getHoloBlue());
        set1.setColors(colors);

        PieData data = new PieData(xVals, set1);
        
        mChart.setData(data);

        // undo all highlights
        mChart.highlightValues(null);
        
        mChart.invalidate();
    }

    public void onClick(View v) {
		if (v.getId() == R.id.btnBack) {
			onBackPressed();
		}
	}

   
}
