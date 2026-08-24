
package com.phonegap.sfa.chart;

import android.support.v4.app.FragmentActivity;

import com.phonegap.sfa.R;

/**
 * Baseclass of all Activities of the Demo Application.
 * 
 * @author Philipp Jahoda
 */
public abstract class DemoBase extends FragmentActivity {

    protected String[] mMonths = new String[] {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"
    };

    protected String[] mParties = new String[] {
            "Pending Calls", "Productive Calls", "Unproductive Calls"
    };
    protected String[] mPStrike = new String[] {
            "Scheduled Calls", "Covered Calls"
    };
    protected String[] mPGoals = new String[] {
            "Balance", "Achived"
    };
    protected String[] mPGoalsBar = new String[] {
            "Target","Achived", "Balance"
    };
    @Override
    public void onBackPressed() {
        super.onBackPressed();
        overridePendingTransition(R.anim.move_left_in_activity, R.anim.move_right_out_activity);
    }
}
