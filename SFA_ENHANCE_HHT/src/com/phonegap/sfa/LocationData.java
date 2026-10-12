package com.phonegap.sfa;

import java.io.Serializable;

import com.google.android.gms.maps.model.LatLng;

public class LocationData implements Serializable {

	private String CustomerName = "";
	private LatLng latLng;

	private double distance=0.0;
	private int customer_sequence=0;
	public double getDistance() {
		return distance;
	}

	public void setDistance(double distance) {
		this.distance = distance;
	}

	public LatLng  getLatLng() {
		return latLng;
	}

	public void setLatLng(LatLng latLng) {
		this.latLng = latLng;
	}

	private String customerCode = "";

	public String getCustomerName() {
		return CustomerName;
	}

	public void setCustomerName(String customerName) {
		CustomerName = customerName;
	}

	public String getCustomerCode() {
		return customerCode;
	}

	public void setCustomerCode(String customerCode) {
		this.customerCode = customerCode;
	}

	public int getCustomer_sequence() {
		return customer_sequence;
	}

	public void setCustomer_sequence(int customer_sequence) {
		this.customer_sequence = customer_sequence;
	}

	

}
