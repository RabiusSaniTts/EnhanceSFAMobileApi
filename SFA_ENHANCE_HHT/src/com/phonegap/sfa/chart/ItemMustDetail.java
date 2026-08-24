package com.phonegap.sfa.chart;

public class ItemMustDetail {

    public String getPrimarykey() {
        return primary_key;
    }

    public void setPrimarykey(String primary_key) {
        this.primary_key = primary_key;
    }
    
    public String getItemmustcode() {
        return itemmustcode;
    }

    public void setItemmustcode(String itemmustcode) {
        this.itemmustcode = itemmustcode;
    }
    public String getActive() {
        return active;
    }

    public void setActive(String active) {
        this.active = active;
    }
    
    public String getQuantity() {
        return quantity;
    }
    
    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }
    
    public String getMslqty() {
        return mslqty;
    }
    
    public void setMslqty(String mslqty) {
        this.mslqty = mslqty;
    }
    
    
    public String getItemcode() {
        return itemcode;
    }


    public void setItemcode(String itemcode) {
        this.itemcode = itemcode;
    }
    
    public String getMdat() {
        return mdat;
    }

    public void setMdat(String mdat) {
        this.mdat = mdat;
    }
    
    private String primary_key="";
    private String itemmustcode="";
    private String itemcode="";
    private String quantity="";
    private String mdat="";
    private String active="";
    private String mslqty="";

    
    
}
