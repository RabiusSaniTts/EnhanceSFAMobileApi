package com.phonegap.sfa;

import android.util.Base64;
import android.util.Log;
import android.widget.Toast;

import org.apache.cordova.api.LOG;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONObject;
import android.util.Base64;

import com.example.bitmaplib.PR;
import com.itextpdf.testutils.ITextTest;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Font.FontFamily;
import com.itextpdf.text.ListItem;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfGState;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfSignatureAppearance;
import com.itextpdf.text.pdf.PdfStamper;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.Image;

import org.json.JSONArray;
import org.json.JSONException;

import android.app.ProgressDialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.os.Looper;
import android.os.Parcelable;
import android.support.v4.content.FileProvider;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.StringTokenizer;

import jxl.*;
import jxl.format.Alignment;
import jxl.write.Label;
import jxl.write.WritableCellFormat;
import jxl.write.WritableFont;
import jxl.write.WritableImage;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;
import jxl.write.biff.RowsExceededException;

public class Xls extends Plugin {
	public static final String ACTION_SAVE_XLS = "saveXLS";
	public static final String ACTION_CUST_STMT = "custStmt";
	public JSONObject jExcel;
	String orderfile = "";
	String statementfile = "";
	String doctype = "";
	static String Fnamexls = "";
	static String PDFfilename = "";
	String OrdNum = "";
	String InvNum = "";
	private int emailTrigger = 0;
	public String dirname;
	public int rowPosition = 7;
	public Boolean hasTitles = false;
	static String TAG = "xls";
	public JSONObject objA;
	public JSONObject pdfdata;
	public JSONArray jsonArr;
	public int headercnt = 0;
	String mailid = "";
	String custSignature = "";
	String custsavedSignature = "";
	private Object callbackContext;
	public int flag = 0;
	public int slno = 0;
	String ordervalue = "";
	public int headcount;

	public String custCode = "";
	public String custName = "";
	public String sName = "";
	public String dDate = "";

	private String callbackId = "";
	private JSONObject status;
	public static final Font BOLD = new Font(FontFamily.HELVETICA, 12, Font.BOLD);
	public static final Font FONT = new Font();

	protected Phrase watermark = new Phrase("FAIRTRADE LLC.",
			new Font(FontFamily.HELVETICA, 60, Font.NORMAL, BaseColor.LIGHT_GRAY));

	public PluginResult execute(String action, JSONArray args, String callbackId) {
		// public boolean execute(String action, JSONArray args, JSONArray querystring)
		// throws JSONException {
		/*
		 * PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		 * result.setKeepCallback(true);
		 */

		PluginResult.Status status = PluginResult.Status.OK;
		String result = "";

		try {

			if (ACTION_SAVE_XLS.equals(action)) {

				try {
					JSONObject params = args.getJSONObject(0);
					mailid = params.getString("tomail");
					String test = params.toString().replaceAll("\\\\", "");
					test = test.substring(8, test.length() - 1);
					test = test.substring(1, test.length() - 1);

					jsonArr = new JSONArray(test);

					custSignature = params.getString("custSignature");
					custsavedSignature = params.getString("custSignature");
					ordervalue = params.getString("ordertotal");
					// getString("ordertotal");

					for (int z = 0; z < jsonArr.length(); z++) {
						objA = jsonArr.getJSONObject(z);
						OrdNum = objA.getString("OrderNumber");
						custCode = objA.getString("CustomerCode");
						custName = objA.getString("CustomerName");
						sName = objA.getString("SalesmanCode") + " - " + objA.getString("SalesmanName");
						dDate = objA.getString("Date");
					}

					Date now = new Date();
					String nowAsString = new SimpleDateFormat("yyyyMMddhhmmss").format(now);
					// Fnamexls="SalesOrder_"+nowAsString+".xls";
					// Fnamexls=OrdNum +"-"+nowAsString+".xls";
					Fnamexls = OrdNum + ".xls";
					// Fnamexls = "SalesOrder_" + nowAsString + ".xls";
					File sdCard = Environment.getExternalStorageDirectory();
					File directory = new File(Environment.getExternalStorageDirectory() + "/OrderExcel");
					//aswin add for showing directory in devices
					//File directory = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS) + "/OrderExcel");
					
					directory.mkdirs();

					File file = new File(directory, Fnamexls);

					WritableWorkbook wb = this.createWorkbook(Fnamexls);

					emailTrigger = jsonArr.length();
					WritableSheet sheetObject = this.createSheet(wb, Fnamexls, 1);

					for (int i = 0; i < jsonArr.length(); i++) {
						jExcel = jsonArr.getJSONObject(i);
						emailTrigger--;
						headcount = 0;
						doctype = "order";
						jsonObjectToCell(sheetObject, jExcel);

					}

					wb.write();
					wb.close();
					System.out.println(emailTrigger);
					if (emailTrigger == 0) {
					    this.hasTitles = false;
					    rowPosition = 7;

					    // Excel file full path
					    String textFilePath = Environment.getExternalStorageDirectory().getAbsolutePath()
					            + "/OrderExcel/" + Fnamexls;

					    // Derive only the PDF file *name*, not full path
					    String pdfFileName = Fnamexls.substring(0, Fnamexls.lastIndexOf('.')) + ".pdf";

					    // Full path for PDF file creation
					    String pdfFullPath = Environment.getExternalStorageDirectory().getAbsolutePath()
					            + "/OrderExcel/" + pdfFileName;

					    // Convert to PDF
					    convertTopdf(textFilePath, pdfFullPath);

					    // Store only filename, not the full path
					    PDFfilename = pdfFileName;

					    // Send email with both attachments
					    sendEmail();
					}


					// return result;
					// return new PluginResult(status, result);
				} catch (IOException ex) {
					Log.e(TAG, ex.getStackTrace().toString());
					Log.e(TAG, ex.getMessage());
					return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
				}
			}

			else if (ACTION_CUST_STMT.equals(action)) {
				Log.e(TAG, "JTR TEST");

				try {

					Log.e(TAG, "JTR TEST");
					JSONObject params = args.getJSONObject(0);
					mailid = params.getString("tomail");
					String test = params.toString().replaceAll("\\\\", "");
					test = test.substring(8, test.length() - 1);
					test = test.substring(1, test.length() - 1);

					jsonArr = new JSONArray(test);
					// commented by JTR 08-10-2018
					// custSignature= params.getString("custSignature");
					// custsavedSignature = params.getString("custSignature");
					// ordervalue =params.getString("ordertotal");
					// getString("ordertotal");

					for (int z = 0; z < jsonArr.length(); z++) {
						objA = jsonArr.getJSONObject(z);

						// InvNum = objA.getString("invoicenumber");
						InvNum = "Customer Statement";

					}

					Date now = new Date();
					String nowAsString = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss").format(now);
					// Fnamexls="SalesOrder_"+nowAsString+".xls";
					// Fnamexls=OrdNum +"-"+nowAsString+".xls";
					Fnamexls = InvNum + ".xls";

					File sdCard = Environment.getExternalStorageDirectory();
					File directory = new File(Environment.getExternalStorageDirectory() + "/StatementExcel");
					//
					// if(directory.exists())
					// {
					directory.delete();
					// }
					directory.mkdirs();
					File file = new File(directory, Fnamexls);

					WritableWorkbook wb = this.createWorkbookStmt(statementfile);

					emailTrigger = jsonArr.length();
					WritableSheet sheetObject = this.createSheet(wb, Fnamexls, 1);

					for (int i = 0; i < jsonArr.length(); i++) {
						jExcel = jsonArr.getJSONObject(i);
						emailTrigger--;
						headcount = 0;
						doctype = "custstmt";
						jsonObjectToCellStmt(sheetObject, jExcel);

					}

					wb.write();
					wb.close();
					System.out.println(emailTrigger);
					if (emailTrigger == 0) {
						this.hasTitles = false;
						rowPosition = 7;
						String textFilePath = Environment.getExternalStorageDirectory().getAbsolutePath()
								+ "/StatementExcel" + "/" + Fnamexls;

						PDFfilename = textFilePath.substring(0, textFilePath.lastIndexOf('.')) + ".pdf";
						// To convert into PDF format
						convertTopdfStmt(textFilePath, PDFfilename);

						// To Send Mail
						// sendEmailStmt();
						sendEmail();

						// email(null, "towelltake1@gmail.com", "sujeeth.menon@wjtowell.com",
						// "SalesOrder", "EMAIL", null);
					}

					// return result;
					// return new PluginResult(status, result);
				} catch (IOException ex) {
					Log.e(TAG, ex.getStackTrace().toString());
					Log.e(TAG, ex.getMessage());
					return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
				}
			}

			// callbackContext.error("Invalid action");

			// return result;
			return new PluginResult(PluginResult.Status.OK);

		} catch (Exception e) {
			System.err.println("Exception: " + e.getMessage());
			// callbackContext.error(e.getMessage());
			Log.v(TAG, e.getStackTrace().toString());
			// return result;
		}

		// return result;
		return new PluginResult(PluginResult.Status.OK);

	}

	/*
	 * public static void email(Context context, String emailTo, String emailCC,
	 * String subject, String emailText, String[] filePaths) { String
	 * filename=Fnamexls; String pdffilename = PDFfilename;
	 * 
	 * 
	 * String filelocation =
	 * Environment.getExternalStorageDirectory().getAbsolutePath()+ "/OrderExcel/" +
	 * filename; //String pdffilelocation =
	 * Environment.getExternalStorageDirectory().getAbsolutePath()+ "/OrderExcel/" +
	 * pdffilename; // Uri path = Uri.fromFile(filelocation);
	 * 
	 * filePaths = new String[] {filelocation, pdffilename}; //need to
	 * "send multiple" to get more than one attachment final Intent emailIntent =
	 * new Intent(Intent.ACTION_SEND_MULTIPLE); emailIntent.setType("text/plain");
	 * emailIntent.putExtra(android.content.Intent.EXTRA_EMAIL, new
	 * String[]{emailTo}); emailIntent.putExtra(android.content.Intent.EXTRA_CC, new
	 * String[]{emailCC}); emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
	 * emailIntent.putExtra(Intent.EXTRA_TEXT, emailText); //has to be an ArrayList
	 * ArrayList<Uri> uris = new ArrayList<Uri>(); //convert from paths to Android
	 * friendly Parcelable Uri's for (String file : filePaths) { File fileIn = new
	 * File(file); Uri u = Uri.fromFile(fileIn); uris.add(u); }
	 * emailIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris); try {
	 * 
	 * this.cordova.startActivityForResult(this, emailIntent, 0);
	 * Log.i("Finished sending email...", ""); } catch
	 * (android.content.ActivityNotFoundException ex) {
	 * Toast.makeText(cordova.getActivity(), "There is no email client installed.",
	 * Toast.LENGTH_SHORT).show(); }
	 * //context.startActivity(Intent.createChooser(emailIntent, "Send mail...")); }
	 */
	public void convertTopdf(String textFilePath, String outputPath) {
		FileInputStream fis = null;
		DataInputStream in = null;
		InputStreamReader isr = null;
		BufferedReader br = null;
		try {

			// Rectangle pagesize = new Rectangle(216f, 720f);
			Document document = new Document();
			PdfWriter.getInstance(document, new FileOutputStream(outputPath));

			/*
			 * PdfWriter writer = PdfWriter.getInstance(document, new
			 * FileOutputStream(outputPath)); writer.setPageEvent(new WatermarkPageEvent());
			 */
			document.open();

			File file = new File(textFilePath);
			document.add(new Chunk(""));
			if (file.exists()) {
				fis = new FileInputStream(file);
				in = new DataInputStream(fis);
				isr = new InputStreamReader(in);
				br = new BufferedReader(isr);
				String strLine;

				// sujee commented no need of underline can be used in future
				// chunk.setUnderline(+1f,-2f);//1st co-ordinate is for line width,2nd is space
				// between

				Font bfBold12 = new Font(FontFamily.TIMES_ROMAN, 8, Font.BOLD, new BaseColor(0, 0, 0));
				Font bf12 = new Font(FontFamily.TIMES_ROMAN, 7);
				Font largeItalic = new Font(Font.FontFamily.HELVETICA, 15, Font.ITALIC);
				Font smallItalic = new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC);
				DecimalFormat df = new DecimalFormat("0.00");

				// create a paragraph
				Paragraph paragraph = new Paragraph("Sales Order :" + OrdNum, largeItalic);

				Paragraph p3 = new Paragraph("Date :" + dDate, largeItalic);
				Paragraph p1 = new Paragraph("Customer :" + custCode + " - " + custName, largeItalic);
				Paragraph p2 = new Paragraph("Salesman :" + sName, largeItalic);

				Paragraph ordertot = new Paragraph("ORDER TOTAL:" + ordervalue + " OMR", bfBold12);

				Chunk chunk = new Chunk("Customer Signature _________________", smallItalic);

				// specify column widths
				// float[] columnWidths = {1.5f,3.5f, 3f, 3.5f, 3f,2.5f, 3.5f, 2.5f,
				// 2.5f,1.5f,1.5f,1.5f,1.5f,3f,2.5f};
				// float[] columnWidths = { 0.5f, 1.5f, 1.5f, 2f, 1f, 1f, 2f, 1f, 1f, 1f, 1f,
				// 1f, 1f, 1f, 1.3f, 1.3f };
				float[] columnWidths = { 0.5f, 1.5f, 1.5f, 2f, 1f, 1f, 1f, 1f, 1f, 1f };
				// create PDF table with the given widths
				PdfPTable table = new PdfPTable(columnWidths);
				// set table width a percentage of the page width

				table.setWidthPercentage(100f);

				// insert column headings
				insertCell(table, "Sno", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Item Code", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Barcode", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "ItemDescription", Element.ALIGN_LEFT, 1, bfBold12);
				// insertCell(table, "SalesmanName", Element.ALIGN_LEFT, 1, bfBold12);
				// insertCell(table, "SalesmanCode", Element.ALIGN_LEFT, 1, bfBold12);
				// insertCell(table, "Customer Code", Element.ALIGN_LEFT, 1, bfBold12);
				// insertCell(table, "CustomerName", Element.ALIGN_LEFT, 1, bfBold12);
				// insertCell(table, "ArticleCode", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Cases", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Units", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "UPC", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Foc", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Caseprice", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Unitprice", Element.ALIGN_LEFT, 1, bfBold12);
				// insertCell(table, "Order Number", Element.ALIGN_LEFT, 1, bfBold12);
				// insertCell(table, "Date", Element.ALIGN_LEFT, 1, bfBold12);

				table.setHeaderRows(1);
				/* */
				int count = 0;
				for (int z = 0; z < jsonArr.length(); z++) {
					// JSONObject iData = jsonArr.getJSONObject(z);
					JSONObject objectInArray = jsonArr.getJSONObject(z);

					String slno = objectInArray.getString("Slno");
					count++;
					slno = String.valueOf(count);

					insertCell(table, slno, Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("Itemcode"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("barcode"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("ItemDescription"), Element.ALIGN_LEFT, 1, bf12);
					// insertCell(table, objectInArray.getString("SalesmanName"),
					// Element.ALIGN_LEFT, 1, bf12);
					// insertCell(table, objectInArray.getString("SalesmanCode") ,
					// Element.ALIGN_LEFT, 1, bf12);
					// insertCell(table, objectInArray.getString("CustomerCode"),
					// Element.ALIGN_LEFT, 1, bf12);
					// insertCell(table, objectInArray.getString("CustomerName"),
					// Element.ALIGN_LEFT, 1, bf12);
					// insertCell(table, objectInArray.getString("Articalcode"), Element.ALIGN_LEFT,
					// 1, bf12);
					insertCell(table, objectInArray.getString("cases"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("units"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("Upc"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("FocQty"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("Caseprice"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("Unitprice"), Element.ALIGN_LEFT, 1, bf12);
					// insertCell(table, objectInArray.getString("OrderNumber"), Element.ALIGN_LEFT,
					// 1, bf12);
					// insertCell(table, objectInArray.getString("Date"), Element.ALIGN_LEFT, 1,
					// bf12);

				}

				InputStream ims = cordova.getActivity().getAssets().open("Enlogonew.bmp");
				Bitmap bmp = BitmapFactory.decodeStream(ims);
				ByteArrayOutputStream stream = new ByteArrayOutputStream();
				bmp.compress(Bitmap.CompressFormat.PNG, 100, stream);
				Image Logo = Image.getInstance(stream.toByteArray());
				Logo.setAlignment(Image.ALIGN_CENTER);
				// sujee commented not to display logo for Enjhance 15/05/2018
				// document.add(Logo);

				// add the PDF table to the paragraph

				/*
				 * String line = br.readLine(); process(table, line, BOLD); while ((line =
				 * br.readLine()) != null) { System.out.println("sujeee"+line); process(table,
				 * line, FONT); } System.out.println("sujeee closed"); br.close();
				 */

				paragraph.add(table);
				// add the paragraph to the document
				document.add(p3);
				document.add(p1);
				document.add(p2);
				document.add(paragraph);
				document.add(ordertot);
				// sujee commented not to print copyrights
				// document.add(chunk);

				System.out.println("Pdf created successfully..");

				try {
					// get input stream
					// InputStream ims = getAssets().open("myImage.png");
					// IsBase64Encoded(custSignature);
					final String pureBase64Encoded = custSignature.substring(custSignature.indexOf(",") + 1);
					IsBase64Encoded(pureBase64Encoded, document, chunk);
					// checkBase64Data(pureBase64Encoded);
					if (flag == 0) {
						byte[] decodedBytes = Base64.decode(pureBase64Encoded, Base64.DEFAULT);
						Base64.encodeToString(decodedBytes, Base64.URL_SAFE | Base64.NO_PADDING);
						ByteArrayOutputStream baos = new ByteArrayOutputStream();

						Bitmap decodedBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);

						// InputStream ims = cordova.getActivity().getAssets().open("newlog.bmp");
						// Bitmap bmp = BitmapFactory.decodeStream(ims);
						// ByteArrayOutputStream stream = new ByteArrayOutputStream();
						decodedBitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);
						Image image = Image.getInstance(baos.toByteArray());
						// image.setAbsolutePosition(450f, 10f);
						// image.setAbsolutePosition(5f, 25f);
						image.scaleAbsoluteWidth(250f);
						image.scaleAbsoluteHeight(50f);
						document.add(image);
						document.add(chunk);
					} else {
						document.add(chunk);
					}
				} catch (IOException ex) {
					return;
				}

				Log.i(TAG, "Converting PDF");

				// showAlertDialog("Converting text...", "Converting text to PDF finished...
				// Generated PDF saved in " + outputPath);
			} else {
				Log.i(TAG, "Error Converting....");
				// showAlertDialog("Converting text...", "File " + textFilePath + " does not
				// exist!");
			}

			document.close();
		} catch (Exception e) {
			Log.i(TAG, e.toString());
		}
	}

	public void convertTopdfStmt(String textFilePath, String outputPath) {
		FileInputStream fis = null;
		DataInputStream in = null;
		InputStreamReader isr = null;
		BufferedReader br = null;
		try {

			// Rectangle pagesize = new Rectangle(216f, 720f);
			Document document = new Document();
			PdfWriter.getInstance(document, new FileOutputStream(outputPath));

			/*
			 * PdfWriter writer = PdfWriter.getInstance(document, new
			 * FileOutputStream(outputPath)); writer.setPageEvent(new WatermarkPageEvent());
			 */
			document.open();

			File file = new File(textFilePath);
			document.add(new Chunk(""));
			if (file.exists()) {
				fis = new FileInputStream(file);
				in = new DataInputStream(fis);
				isr = new InputStreamReader(in);
				br = new BufferedReader(isr);
				String strLine;

				// sujee commented no need of underline can be used in future
				// chunk.setUnderline(+1f,-2f);//1st co-ordinate is for line width,2nd is space
				// between

				Font bfBold12 = new Font(FontFamily.TIMES_ROMAN, 8, Font.BOLD, new BaseColor(0, 0, 0));
				Font bf12 = new Font(FontFamily.TIMES_ROMAN, 7);
				Font largeItalic = new Font(Font.FontFamily.HELVETICA, 15, Font.ITALIC);
				Font smallItalic = new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC);
				DecimalFormat df = new DecimalFormat("0.00");

				// create a paragraph
				Paragraph paragraph = new Paragraph("Customer Statement Pdf", largeItalic);
				// Paragraph ordertot = new Paragraph("ORDER TOTAL:"+ordervalue+ "
				// OMR",bfBold12);

				// Chunk chunk=new Chunk("Customer Signature _________________",smallItalic);

				// specify column widths
				// float[] columnWidths = {1.5f,3.5f, 3f, 3.5f, 3f,2.5f, 3.5f, 2.5f,
				// 2.5f,1.5f,1.5f,1.5f,1.5f,3f,2.5f};
				float[] columnWidths = { 0.5f, 3f, 3f, 2f, 2f, 2f };
				// create PDF table with the given widths
				PdfPTable table = new PdfPTable(columnWidths);
				// set table width a percentage of the page width

				table.setWidthPercentage(100f);

				// insert column headings
				insertCell(table, "Slno", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Transcation Date", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Invoice Number", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Invoice Amount", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "Balance Amount", Element.ALIGN_LEFT, 1, bfBold12);
				insertCell(table, "PDC Amount", Element.ALIGN_LEFT, 1, bfBold12);

				table.setHeaderRows(1);
				/* */
				int count = 0;
				for (int z = 0; z < jsonArr.length(); z++) {
					// JSONObject iData = jsonArr.getJSONObject(z);
					JSONObject objectInArray = jsonArr.getJSONObject(z);

					String slno = objectInArray.getString("Slno");
					count++;
					slno = String.valueOf(count);

					insertCell(table, slno, Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("transactiondate"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("invoicenumber"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("totalinvoiceamount"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("invoicebalance"), Element.ALIGN_LEFT, 1, bf12);
					insertCell(table, objectInArray.getString("pdcbalance"), Element.ALIGN_LEFT, 1, bf12);

				}

				// InputStream ims = cordova.getActivity().getAssets().open("Enlogonew.bmp");
				// Bitmap bmp = BitmapFactory.decodeStream(ims);
				// ByteArrayOutputStream stream = new ByteArrayOutputStream();
				// bmp.compress(Bitmap.CompressFormat.PNG, 100, stream);
				// Image Logo = Image.getInstance(stream.toByteArray());
				// Logo.setAlignment(Image.ALIGN_CENTER);
				// sujee commented not to display logo for Enjhance 15/05/2018
				// document.add(Logo);

				// add the PDF table to the paragraph

				/*
				 * String line = br.readLine(); process(table, line, BOLD); while ((line =
				 * br.readLine()) != null) { System.out.println("sujeee"+line); process(table,
				 * line, FONT); } System.out.println("sujeee closed"); br.close();
				 */

				paragraph.add(table);
				// add the paragraph to the document
				document.add(paragraph);
				// document.add(ordertot);
				// sujee commented not to print copyrights
				// document.add(chunk);

				System.out.println("Customer Statement Pdf created successfully..");

				/*
				 * try { // get input stream //InputStream ims =
				 * getAssets().open("myImage.png"); // IsBase64Encoded(custSignature); final
				 * String pureBase64Encoded = custSignature.substring(custSignature.indexOf(",")
				 * + 1); // IsBase64Encoded(pureBase64Encoded,document,chunk); //
				 * checkBase64Data(pureBase64Encoded); if(flag == 0){ byte[] decodedBytes =
				 * Base64.decode(pureBase64Encoded, Base64.DEFAULT);
				 * Base64.encodeToString(decodedBytes, Base64.URL_SAFE | Base64.NO_PADDING);
				 * ByteArrayOutputStream baos = new ByteArrayOutputStream();
				 * 
				 * Bitmap decodedBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0,
				 * decodedBytes.length);
				 * 
				 * //InputStream ims = cordova.getActivity().getAssets().open("newlog.bmp"); //
				 * Bitmap bmp = BitmapFactory.decodeStream(ims); // ByteArrayOutputStream stream
				 * = new ByteArrayOutputStream();
				 * decodedBitmap.compress(Bitmap.CompressFormat.PNG, 100, baos); Image image =
				 * Image.getInstance(baos.toByteArray()); // image.setAbsolutePosition(450f,
				 * 10f); //image.setAbsolutePosition(5f, 25f); image.scaleAbsoluteWidth(250f);
				 * image.scaleAbsoluteHeight(50f); document.add(image); // document.add(chunk);
				 * }else { // document.add(chunk); } } catch(IOException ex) { return; }
				 */

				Log.i(TAG, "Converting PDF");

				// showAlertDialog("Converting text...", "Converting text to PDF finished...
				// Generated PDF saved in " + outputPath);
			} else {
				Log.i(TAG, "Error Converting....");
				// showAlertDialog("Converting text...", "File " + textFilePath + " does not
				// exist!");
			}

			document.close();
		} catch (Exception e) {
			Log.i(TAG, e.toString());
		}
	}

	public void jsonObjectToCellStmt(WritableSheet sheetObj, JSONObject obj) {
		try {

			int columnPosition = 0;

			Iterator<?> keys = obj.keys();

			/*
			 * insertCell(table, objectInArray.getString("transactiondate") ,
			 * Element.ALIGN_LEFT, 1, bf12); insertCell(table,
			 * objectInArray.getString("invoicenumber") , Element.ALIGN_LEFT, 1, bf12);
			 * insertCell(table, objectInArray.getString("invoicebalance") ,
			 * Element.ALIGN_LEFT, 1, bf12); insertCell(table,
			 * objectInArray.getString("pdcbalance") , Element.ALIGN_LEFT, 1, bf12);
			 * insertCell(table, "Sno", Element.ALIGN_LEFT, 1, bfBold12); insertCell(table,
			 * "Transcation Date", Element.ALIGN_LEFT, 1, bfBold12); insertCell(table,
			 * "Invoice No", Element.ALIGN_LEFT, 1, bfBold12); insertCell(table, "Balance",
			 * Element.ALIGN_LEFT, 1, bfBold12); insertCell(table, "Total Amount",
			 * Element.ALIGN_LEFT, 1, bfBold12);
			 * 
			 */

			while (keys.hasNext()) {

				String key = (String) keys.next();
				String value = obj.getString(key);
				if (key.equals("Slno")) {
					slno++;
					value = String.valueOf(slno);
					columnPosition = 0;
				}
				if (key.equals("transactiondate")) {
					key = "Transcation Date";
					columnPosition = 1;
				}
				if (key.equals("invoicenumber")) {
					key = "Invoice Number";
					columnPosition = 2;
				}
				if (key.equals("totalinvoiceamount")) {
					key = "Invoice Amount";
					columnPosition = 3;
				}

				if (key.equals("invoicebalance")) {
					key = "Balance Amount";
					columnPosition = 4;
				}
				if (key.equals("pdcbalance")) {
					key = "PDC Amount";
					columnPosition = 5;
				}

				try {

					if (!hasTitles) {

						this.writeCell(columnPosition, 5, key, true, sheetObj);
					}

					this.writeCell(columnPosition, rowPosition, value, false, sheetObj);

					Log.i(TAG, key + ":" + value);

					// columnPosition++;
				} catch (WriteException we) {
					Log.i(TAG, we.toString());
				}

			}

			this.rowPosition++;
			this.hasTitles = true;

		} catch (JSONException e) {
			Log.i(TAG, e.toString());
		}
	}

	public void process(PdfPTable table, String line, Font font) {
		StringTokenizer tokenizer = new StringTokenizer(line, ";");
		int c = 0;
		while (tokenizer.hasMoreTokens() && c++ < 3) {
			table.addCell(new Phrase(tokenizer.nextToken(), font));
		}
	}

	public boolean IsBase64Encoded(String value, Document document, Chunk chunk) {
		try {
			byte[] decodedString = Base64.decode(value, Base64.DEFAULT);
			// byte[] encodedBytes = Base64.decode(value.getBytes(), Base64.URL_SAFE);

			// byte[] imageBytes = Base64.decode(value, Base64.DEFAULT);
			Bitmap decodedImage = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			// BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
			decodedImage.compress(Bitmap.CompressFormat.PNG, 100, baos);
			/*
			 * Image image = Image.getInstance(baos.toByteArray()); //
			 * image.setAbsolutePosition(450f, 10f); //image.setAbsolutePosition(5f, 25f);
			 * image.scaleAbsoluteWidth(250f); image.scaleAbsoluteHeight(50f);
			 * document.add(image); document.add(chunk);
			 */
			flag = 0;
			return true;
		} catch (Exception e) {
			flag = 1;
			return false;
		}
	}

	public String checkBase64Data(String pureBase64Encoded) {
		// TODO Auto-generated method stub
		Log.i(TAG, "Check Data");
		String b64 = Base64.encodeToString(pureBase64Encoded.getBytes(), 0);
		byte[] encodeValue = Base64.encode(pureBase64Encoded.getBytes(), Base64.DEFAULT);

		return b64;
	}

	public void insertCell(PdfPTable table, String text, int align, int colspan, Font font) {

		// create a new cell with the specified Text and Font
		PdfPCell cell = new PdfPCell(new Phrase(text.trim(), font));
		// set the cell alignment
		cell.setHorizontalAlignment(align);
		// set the cell column span in case you want to merge two or more cells
		cell.setColspan(colspan);
		// in case there is no text and you wan to create an empty row
		if (text.trim().equalsIgnoreCase("")) {
			cell.setMinimumHeight(10f);
		}
		// add the call to the table
		table.addCell(cell);

	}

	public void jsonObjectToCell(WritableSheet sheetObj, JSONObject obj) {
		try {

			int columnPosition = -1;

			Iterator<?> keys = obj.keys();

			while (keys.hasNext()) {

				String key = (String) keys.next();
				String value = obj.getString(key);
				columnPosition = -1;
				
				if (key.equals("Slno")) {
					slno++;
					value = String.valueOf(slno);
					columnPosition = 0;
				}
				if (key.equals("Itemcode")) {
					key = "Item Code";
					columnPosition = 1;
				}
				if (key.equals("barcode")) {
					key = "Barcode";
					columnPosition = 2;
				}
				if (key.equals("ItemDescription")) {
					key = "Item Description";
					columnPosition = 3;
				}
//				if (key.equals("SalesmanName")) {
//					key = "Salesman";
//					columnPosition = 4;
//				}
//				if (key.equals("SalesmanCode")) {
//					key = "S.Code";
//					columnPosition = 5;
//				}
//
//				if (key.equals("CustomerCode")) {
//					key = "Customer Code";
//					columnPosition = 6;
//				}
//				if (key.equals("CustomerName")) {
//					key = "Customer Name";
//					columnPosition = 7;
//				}
//
//				if (key.equals("Articalcode")) {
//					key = "ArticleCode";
//					columnPosition = 8;
//				}

				if (key.equals("cases")) {
					key = "Cases";
					columnPosition = 4;
				}
				if (key.equals("units")) {
					key = "Units";
					columnPosition = 5;
				}
				if (key.equals("Upc")) {
					columnPosition = 6;
				}
				if (key.equals("FocQty")) {
					columnPosition = 7;
				}
				if (key.equals("Caseprice")) {
					columnPosition = 8;
				}
				if (key.equals("Unitprice")) {
					columnPosition = 9;
				}
//				if (key.equals("OrderNumber")) {
//					key = "OrderNo";
//					columnPosition = 15;
//				}
//				if (key.equals("Date")) {
//					columnPosition = 16;
//				}
				if (columnPosition != -1) {
					try {

						if (!hasTitles) {

							this.writeCell(columnPosition, 6, key, true, sheetObj);
						}

						this.writeCell(columnPosition, rowPosition, value, false, sheetObj);

						Log.i(TAG, key + ":" + value);

						// columnPosition++;
					} catch (WriteException we) {
						Log.i(TAG, we.toString());
					}
				}
			}

			this.rowPosition++;
			this.hasTitles = true;

		} catch (JSONException e) {
			Log.i(TAG, e.toString());
		}
	}

	/**
	 * @param fileName - the name to give the new workbook file
	 * @return - a new WritableWorkbook with the given fileName
	 */
	public WritableWorkbook createWorkbook(String fileName) {
		// exports must use a temp file while writing to avoid memory hogging
		WorkbookSettings wbSettings = new WorkbookSettings();
		wbSettings.setUseTemporaryFileDuringWrite(true);

		Date now = new Date();
		String nowAsString = new SimpleDateFormat("yyyyMMddhhmmss").format(now);

		// fileName="SalesOrder_"+nowAsString+".xls";
		// fileName=OrdNum +"-"+nowAsString+".xls"; OrdNum+".xls";
		// fileName=OrdNum+".xls";
		// fileName="SalesOrder_"+nowAsString+".xls";
		// get the sdcard's directory
		File sdCard = Environment.getExternalStorageDirectory();
		// add on the your app's path
		File dir = new File(Environment.getExternalStorageDirectory() + "/OrderExcel");
		// make them in case they're not there
		dir.mkdirs();
		// create a standard java.io.File object for the Workbook to use
		File wbfile = new File(dir, fileName);

		WritableWorkbook wb = null;

		try {
			// create a new WritableWorkbook using the java.io.File and
			// WorkbookSettings from above
			wb = Workbook.createWorkbook(wbfile, wbSettings);
		} catch (IOException ex) {
			Log.e(TAG, ex.getStackTrace().toString());
			Log.e(TAG, ex.getMessage());
		}

		return wb;
	}

	/**
	 * @param fileName - the name to give the new workbook file
	 * @return - a new WritableWorkbook with the given fileName
	 */
	public WritableWorkbook createWorkbookStmt(String fileName) {
		// exports must use a temp file while writing to avoid memory hogging
		WorkbookSettings wbSettings = new WorkbookSettings();
		wbSettings.setUseTemporaryFileDuringWrite(true);

		Date now = new Date();
		String nowAsString = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss").format(now);

		// fileName="SalesOrder_"+nowAsString+".xls";
		// fileName=OrdNum +"-"+nowAsString+".xls"; OrdNum+".xls";
		fileName = InvNum + ".xls";
		// get the sdcard's directory
		File sdCard = Environment.getExternalStorageDirectory();
		// add on the your app's path
		File dir = new File(Environment.getExternalStorageDirectory() + "/StatementExcel");
		// make them in case they're not there
		dir.mkdirs();
		// create a standard java.io.File object for the Workbook to use
		File wbfile = new File(dir, fileName);

		WritableWorkbook wb = null;

		try {
			// create a new WritableWorkbook using the java.io.File and
			// WorkbookSettings from above
			wb = Workbook.createWorkbook(wbfile, wbSettings);
		} catch (IOException ex) {
			Log.e(TAG, ex.getStackTrace().toString());
			Log.e(TAG, ex.getMessage());
		}

		return wb;
	}

	/**
	 * @param wb         - WritableWorkbook to create new sheet in
	 * @param sheetName  - name to be given to new sheet
	 * @param sheetIndex - position in sheet tabs at bottom of workbook
	 * @return - a new WritableSheet in given WritableWorkbook
	 */
	public WritableSheet createSheet(WritableWorkbook wb, String sheetName, int sheetIndex) {
		// create a new WritableSheet and return it
		return wb.createSheet(sheetName, sheetIndex);
	}

	/**
	 * @param columnPosition - column to place new cell in
	 * @param rowPosition    - row to place new cell in
	 * @param contents       - string value to place in cell
	 * @param headerCell     - whether to give this cell special formatting
	 * @param sheet          - WritableSheet to place cell in
	 * @throws RowsExceededException - thrown if adding cell exceeds .xls row limit
	 * @throws WriteException        - Idunno, might be thrown
	 */

	public void writeCell(int columnPosition, int rowPosition, String contents, boolean headerCell, WritableSheet sheet)
			throws RowsExceededException, WriteException {
		// create a new cell with contents at position
		Label newCell = new Label(columnPosition, rowPosition, contents);
		if (headcount == 0) {
			if (doctype == "order") {
				Label header = new Label(4, 3, " SALES ORDER :" + OrdNum);
				WritableFont headerFont = new WritableFont(WritableFont.COURIER, 10, WritableFont.BOLD);
				WritableCellFormat headerFormat = new WritableCellFormat(headerFont);
				// center align the cells' contents
				headerFormat.setAlignment(Alignment.CENTRE);
				header.setCellFormat(headerFormat);

				Label hdate = new Label(4, 0, " Date :" + dDate);
				hdate.setCellFormat(headerFormat);
				Label hCust = new Label(4, 1, " Customer :" + custCode + " - " + custName);
				hCust.setCellFormat(headerFormat);
				Label hSalesman = new Label(4, 2, " Salesman :" + sName);
				hSalesman.setCellFormat(headerFormat);

				Label ordertot = new Label(4, 4, " ORDER TOTAL : " + ordervalue + " OMR");
				// Label orderval = new Label(6,1,ordervalue);
				ordertot.setCellFormat(headerFormat);

				sheet.addCell(hdate);
				sheet.addCell(hCust);
				sheet.addCell(hSalesman);
				sheet.addCell(header);
				headcount = 1;
				sheet.addCell(ordertot);
			} else if (doctype == "custstmt") {
				Label header = new Label(3, 0, " Customer Statement");
				WritableFont headerFont = new WritableFont(WritableFont.COURIER, 10, WritableFont.BOLD);
				WritableCellFormat headerFormat = new WritableCellFormat(headerFont);
				// center align the cells' contents
				headerFormat.setAlignment(Alignment.CENTRE);
				header.setCellFormat(headerFormat);

				sheet.addCell(header);
				headcount = 1;
				// sheet.addCell(ordertot);
			}
		}

		if (headerCell) {
			// give header cells size 10 Arial bolded
			WritableFont headerFont = new WritableFont(WritableFont.TAHOMA, 8, WritableFont.BOLD);
			WritableCellFormat headerFormat = new WritableCellFormat(headerFont);
			// center align the cells' contents
			headerFormat.setAlignment(Alignment.CENTRE);
			newCell.setCellFormat(headerFormat);
		} else {
			WritableFont contentFont = new WritableFont(WritableFont.TAHOMA, 8, WritableFont.NO_BOLD);
			WritableCellFormat contentFormat = new WritableCellFormat(contentFont);
			// center align the cells' contents
			contentFormat.setAlignment(Alignment.CENTRE);

			newCell.setCellFormat(contentFormat);
		}

		sheet.setColumnView(1, 15);
		sheet.setColumnView(2, 15);
		sheet.setColumnView(3, 35);
		sheet.setColumnView(4, 15);
		sheet.setColumnView(6, 15);
		sheet.setColumnView(7, 25);
		sheet.setColumnView(8, 15);
		sheet.addCell(newCell);

	}
	
	public void sendEmail() {
	    Log.i("Send email", "");

	    try {
	        String[] TO = { mailid };
	        String[] CC = { "" };

	        File excelFile;
	        File pdfFile;
	        String subject;
	        String message;

	        if ("order".equals(doctype)) {
	            excelFile = new File(Environment.getExternalStorageDirectory(), "OrderExcel/" + Fnamexls);
	            pdfFile = new File(Environment.getExternalStorageDirectory(), "OrderExcel/" + PDFfilename);
	            subject = "SALES ORDER - " + OrdNum;
	            message = "Dear valued customer,\n\nThank you for placing your order with us.\nPlease find the attached sales order for your reference.";
	        } else {
	            excelFile = new File(Environment.getExternalStorageDirectory(), "StatementExcel/" + Fnamexls);
	            pdfFile = new File(Environment.getExternalStorageDirectory(), "StatementExcel/" + PDFfilename);
	            subject = "CUSTOMER STATEMENT";
	            message = "Dear valued customer,\n\nPlease find your statement attached.";
	        }

	        // Make sure both files exist before trying to attach
	        if (!excelFile.exists()) {
	            Log.e("EmailError", "Excel file not found: " + excelFile.getAbsolutePath());
	            Toast.makeText(cordova.getActivity(), "Excel file missing!", Toast.LENGTH_SHORT).show();
	            return;
	        }

	        if (!pdfFile.exists()) {
	            Log.e("EmailError", "PDF file not found: " + pdfFile.getAbsolutePath());
	            Toast.makeText(cordova.getActivity(), "PDF file missing!", Toast.LENGTH_SHORT).show();
	            return;
	        }

	        Context context = cordova.getActivity();
	        ArrayList<Uri> uris = new ArrayList<Uri>();

	        Uri excelUri = FileProvider.getUriForFile(context,
	                context.getPackageName() + ".provider", excelFile);
	        Uri pdfUri = FileProvider.getUriForFile(context,
	                context.getPackageName() + ".provider", pdfFile);

	        uris.add(excelUri);
	        uris.add(pdfUri);

	        Intent emailIntent = new Intent(Intent.ACTION_SEND_MULTIPLE);
	        emailIntent.setType("message/rfc822");
	        emailIntent.putExtra(Intent.EXTRA_EMAIL, TO);
	        emailIntent.putExtra(Intent.EXTRA_CC, CC);
	        emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
	        emailIntent.putExtra(Intent.EXTRA_TEXT, message);
	        emailIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris);
	        emailIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

	        context.startActivity(Intent.createChooser(emailIntent, "Send Email..."));
	        Toast.makeText(context, "Opening email client...", Toast.LENGTH_LONG).show();

	    } catch (Exception e) {
	        Log.e("EmailError", "Error sending email", e);
	        Toast.makeText(cordova.getActivity(), "Failed to send email: " + e.getMessage(), Toast.LENGTH_LONG).show();
	    }
	}

	/*public void sendEmail() {
	    Log.i("Send email", "");

	    try {
	        String[] TO = { mailid };
	        String[] CC = { "" };

	        File excelFile;
	        File pdfFile;
	        String subject;
	        String message;

	        if ("order".equals(doctype)) {
	            excelFile = new File(Environment.getExternalStorageDirectory(), "OrderExcel/" + Fnamexls);
	            pdfFile = new File(Environment.getExternalStorageDirectory(), "OrderExcel/" + PDFfilename);
	            subject = "SALES ORDER - " + OrdNum;
	            message = "Dear valued customer, Thank you for placing your order with us. Please find the attached sales order for your reference.";
	        } else {
	            excelFile = new File(Environment.getExternalStorageDirectory(), "StatementExcel/" + Fnamexls);
	            pdfFile = new File(Environment.getExternalStorageDirectory(), "StatementExcel/" + PDFfilename);
	            subject = "CUSTOMER STATEMENT";
	            message = "Dear valued customer, Please find your statement attached.";
	        }

	        // Prepare attachments
	        Context context = cordova.getActivity().getApplicationContext();
	        ArrayList<Uri> uris = new ArrayList<Uri>();


	        Uri excelUri = FileProvider.getUriForFile(context, context.getPackageName() + ".provider", excelFile);
	        Uri pdfUri = FileProvider.getUriForFile(context, context.getPackageName() + ".provider", pdfFile);

	        uris.add(excelUri);
	        uris.add(pdfUri);

	        Intent emailIntent = new Intent(Intent.ACTION_SEND_MULTIPLE);
	        emailIntent.setType("message/rfc822");
	        emailIntent.putExtra(Intent.EXTRA_EMAIL, TO);
	        emailIntent.putExtra(Intent.EXTRA_CC, CC);
	        emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
	        emailIntent.putExtra(Intent.EXTRA_TEXT, message);
	        emailIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris);
	        emailIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

	        ((Context) this.cordova).startActivity(Intent.createChooser(emailIntent, "Send Email..."));
	        Toast.makeText(cordova.getActivity(), "Opening email client...", Toast.LENGTH_LONG).show();

	    } catch (Exception e) {
	        Log.e("EmailError", "Error sending email", e);
	        Toast.makeText(cordova.getActivity(), "Failed to send email: " + e.getMessage(), Toast.LENGTH_LONG).show();
	    }
	}*/


// String emailto="sujeeth.menon@wjtowell.com,menon.sujeeth@gmail.com";
	/*public void sendEmail() {
		// TODO Auto-generated method stub
		Log.i("Send email", "");
		// String[] TO = {""};
		String[] TO = { mailid };
		String[] CC = { "" };

		String filename = Fnamexls;
		String pdffilename = PDFfilename;

		if (doctype == "order") {
			File filelocation = new File(Environment.getExternalStorageDirectory().getAbsolutePath() + "/OrderExcel",
					filename);
			File pdffilelocation = new File(Environment.getExternalStorageDirectory().getAbsolutePath() + "/OrderExcel",
					pdffilename);
			Uri path = Uri.fromFile(filelocation);

			Intent emailIntent = new Intent(Intent.ACTION_SEND_MULTIPLE, Uri.parse("mailto:"));
			emailIntent.putExtra(Intent.EXTRA_EMAIL, TO);
			emailIntent.putExtra(Intent.EXTRA_CC, CC);

			emailIntent.putExtra(Intent.EXTRA_SUBJECT, "SALES-ORDER" + "-" + OrdNum);

			emailIntent.setType("text/plain");
			Uri uri1 = Uri.parse("file://" + filelocation);
			Uri uri2 = Uri.parse("file://" + PDFfilename);

			ArrayList<Uri> arrayList = new ArrayList<Uri>();
			arrayList.add(uri1);
			arrayList.add(uri2);

			emailIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, arrayList);

			emailIntent.putExtra(Intent.EXTRA_TEXT,
					"Dear valued customer - Thank you for placing your order with us. Please find the attached  sales order detail for your reference.");

			try {
				((Context) this.cordova).startActivity(Intent.createChooser(emailIntent, "Complete Action..."));
				Log.i("Finished sending email...", "");
				Toast.makeText(cordova.getActivity(), "Email Sent Successfully.", Toast.LENGTH_LONG).show();
			} catch (android.content.ActivityNotFoundException ex) {
				Toast.makeText(cordova.getActivity(), "There is no email client installed.", Toast.LENGTH_SHORT).show();
			}

		} else if (doctype == "custstmt") {
			File filelocation = new File(
					Environment.getExternalStorageDirectory().getAbsolutePath() + "/StatementExcel", filename);
			File pdffilelocation = new File(
					Environment.getExternalStorageDirectory().getAbsolutePath() + "/StatementExcel", pdffilename);
			Uri path = Uri.fromFile(filelocation);

			Intent emailIntent = new Intent(Intent.ACTION_SEND_MULTIPLE, Uri.parse("mailto:"));
			emailIntent.putExtra(Intent.EXTRA_EMAIL, TO);
			emailIntent.putExtra(Intent.EXTRA_CC, CC);

			emailIntent.putExtra(Intent.EXTRA_SUBJECT, "CUSTOMER STATEMENT");

			emailIntent.setType("text/plain");
			Uri uri1 = Uri.parse("file://" + filelocation);
			Uri uri2 = Uri.parse("file://" + PDFfilename);

			ArrayList<Uri> arrayList = new ArrayList<Uri>();
			arrayList.add(uri1);
			arrayList.add(uri2);

			emailIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, arrayList);

			emailIntent.putExtra(Intent.EXTRA_TEXT, "Dear valued customer - Please find your statement attached.");

			try {
				((Context) this.cordova).startActivity(Intent.createChooser(emailIntent, "Complete Action..."));
				Log.i("Finished sending email...", "");
				Toast.makeText(cordova.getActivity(), "Email Sent Successfully.", Toast.LENGTH_LONG).show();
			} catch (android.content.ActivityNotFoundException ex) {
				Toast.makeText(cordova.getActivity(), "There is no email client installed.", Toast.LENGTH_SHORT).show();
			}
		}

		
	}*/

	/*
	 * public static boolean sendEmailnew(String to, String from, String subject,
	 * String message,String[] attachements,String Fnamexls) throws Exception {
	 * String filename=Fnamexls; Mail mail = new Mail(); if (subject != null &&
	 * subject.length() > 0) { mail.setSubject(subject); } else {
	 * mail.setSubject("Subject"); }
	 * 
	 * if (message != null && message.length() > 0) { mail.setBody(message); } else
	 * { mail.setBody("Message"); }
	 * 
	 * mail.setTo(new String[] {to});
	 * 
	 * if (attachements != null) { for (String attachement : attachements) {
	 * //mail.addAttachment(attachement,filename); }
	 * 
	 * } try { if(mail.send()) { //Toast.makeText(cordova.getActivity(),
	 * "Email was sent successfully.", Toast.LENGTH_LONG).show();
	 * 
	 * Log.i(TAG, "Email was sent successfully."); } else {
	 * //Toast.makeText(cordova.getActivity(), "Email was not sent.",
	 * Toast.LENGTH_LONG).show();
	 * 
	 * Log.i(TAG, "Email was not sent."); } } catch(Exception e) { Log.e("MailApp",
	 * "Could not send email", e);
	 * 
	 * } return mail.send(); }
	 */
	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
		super.onActivityResult(requestCode, resultCode, intent);
		LOG.e("EmailComposer", "ResultCode: " + resultCode);

		if (resultCode == 0) {
			Toast.makeText(cordova.getActivity(), "Email Sent Successfully...", Toast.LENGTH_SHORT).show();

			Log.e(TAG, "Email Sent Successfully...");
		} else {
			Toast.makeText(cordova.getActivity(), "Email Sending Failed......", Toast.LENGTH_SHORT).show();
			Log.e(TAG, "Email Sending Failed......");
		}

	}

}
