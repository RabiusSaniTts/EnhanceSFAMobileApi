<?php

class Api_ImportController extends Api_Library_Controller_Action_Abstract
{

    /**
    * @name       init
    * @since      16-03-2012
    * @version    Release: 1
    * @author     PM <pankit@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This is the default function for all Actions.
    *
    */
public function init()
{
	$this->SFA_Comman = new SFA_Comman();
	parent::init();
	set_time_limit(0);
}
 
public function rpchainAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/chain.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content); 

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\chaincmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rporderstatusAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/orderstatus.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content); 

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\orderstatus.bat');
	
	echo "Data imported successfully";
	exit;
}
public function rpcustomerAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/customer.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content); 

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\customercmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rpglmatrixAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/glmatrix.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content); 

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\glmatrixcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rpitemAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/item.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content); 

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\itemcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rpitemgroupAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_itemgroup = $data["rp_itemgroup"]; 
$SFA_Model_Basic = new SFA_Model_Basic();
$SFA_Model_Basic->deletetable("rp_itemgroup");
$tablename = "rp_itemgroup";
$columnname = "(ItemGroupCode,SubMajorcategoryCode,ItemGroupName,ActiveStatus)";
$columndata= "";
foreach($rp_itemgroup as $key=>$val) {
	$columndata .= "(\"".trim($val["ItemGroupCode"])."\", \"".trim($val["SubMajorcategoryCode"])."\",\"".trim($val["ItemGroupName"])."\",".trim($val["ActiveStatus"])."), ";
}

$SFA_Model_Importdata = new SFA_Model_Importdata();

$SFA_Model_Importdata->saveImportdata($tablename , $columnname, substr($columndata, 0, strlen($columndata)-2));
exit;
}

public function divisionroutesettingAction()
{/*
$data = json_decode(file_get_contents('php://input'), true);
$rp_itemgroup = $data["division"]; 
$SFA_Model_Basic = new SFA_Model_Basic();

$SFA_Model_Basic->deletetable("division_route_setting");
$tablename = "division_route_setting";
$columnname = "(Division, 	DivisionName, 	RouteStart, 	RouteEnd, 	BatchPrefix, 	InvoicePrefix)";
$columndata= "";
foreach($rp_itemgroup as $key=>$val) {
	$columndata .= "(\"".trim($val["Division"])."\", \"".trim($val["DivisionName"])."\",\"".trim($val["RouteStart"])."\",\"".trim($val["RouteEnd"])."\",\"".trim($val["BatchPrefix"])."\",\"".trim($val["InvoicePrefix"])."\"), ";
}

$SFA_Model_Importdata = new SFA_Model_Importdata();

$SFA_Model_Importdata->saveImportdata($tablename , $columnname, substr($columndata, 0, strlen($columndata)-2)); */
exit;
}
public function updateimporttablesAction()
{
	$data = json_decode(file_get_contents('php://input'), true);
	$importtables = $data["importtables"]; 

	foreach($importtables as $key=>$val) {
	$param = array();
	$param[1] = trim($val["sman"]);
	$param[2] = trim($val["item"]);
	$param[3] = trim($val["load"]);
	$param[4] = trim($val["customerprice"]);
	$param[5] = trim($val["customer"]);
	$param[6] = trim($val["outstanding"]);
	$param[7] = trim($val["route"]);
	$param[8] = trim($val["matrix"]);
	$param[9] = trim($val["warehouse"]);
	//echo $val["delivery"];
	if($val["delivery"]=="" || $val["delivery"]==null)
	{ 
	$param[10] = 0; }
	else
	{ $param[10] = trim($val["delivery"]); }
	
	
	$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_importtables(?,?,?,?,?,?,?,?,?,?)',$param,'');
	}
exit;
}
public function rpoutstandingAction()
{

	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/outstanding.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content); 

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\outstandingcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rprouteAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/route.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content);

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\routecmd.bat');
	echo "Data imported successfully";	
	exit;
}
public function rpsmanAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/sman.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content);

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\smancmd.bat');
	echo "Data imported successfully";	
exit;
}
/*public function rpsppricingcopyAction()
{
	
$data = json_decode(file_get_contents('php://input'), true);

$rp_sppricingcopy = $data["rp_sppricingcopy"];
//echo count($rp_sppricingcopy);exit;
$SFA_Model_Basic = new SFA_Model_Basic();
$SFA_Model_Basic->deletetable("rp_sppricingcopy");
 $i =0;
foreach($rp_sppricingcopy as $key=>$val) {
 
$param = array();
$param[1] = trim($val["pk"]);
$param[2] = trim($val["ic"]);
$param[3] = trim($val["des"]);
$param[4] = trim($val["sd"]);
$param[5] = trim($val["ed"]);
$param[6] = trim($val["scp"]);
$param[7] = trim($val["spp"]);
$param[8] = trim($val["srcp"]);
$param[9] = trim($val["srp"]);
$param[10] = trim($val["Status"]);
try
{
 $resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_sppricingcopy(?,?,?,?,?,?,?,?,?,?)',$param,'');

}
catch(Exception $e)
{
	echo $e->getMessage()."inside";
	exit;
}
}
echo $i."here";

exit;
}*/
public function rpsppricingAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/pricing.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content);

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\sppricingcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rpstartloadAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/startload.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content);

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\startloadcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rptargetAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/target.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content);

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\targetcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rpwhglmatrixAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/whglmatrix.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content);

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\whglmatrixcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function rpwhstockAction()
{
	$filename = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/whstock.csv');
	if (file_exists($filename)) {
		unlink($filename);
	}
	fopen($filename,'a');
	chmod($filename,0777);
	$content = file_get_contents('php://input');
	file_put_contents($filename, $content);

	exec('start /B C:\wamp\www\sfa\enhance\public\batch\whstockcmd.bat');
	echo "Data imported successfully";
	exit;
}
public function testapiAction () {
	//print_r($this->getRequest()->getPost('salesman',null) );
	echo "<pre>";//print_r($_SERVER);
	$data = json_decode(file_get_contents('php://input'), true);
	print_r($data);
	//print_r($_REQUEST);
	exit;
}
	
	//json
 public function jsonDecode($json)
    {
      $json = str_replace(array("\\\\", "\\\""), array("&#92;", "&#34;"), $json);
      $parts = preg_split("@(\"[^\"]*\")|([\[\]\{\},:])|\s@is", $json, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
      foreach ($parts as $index => $part)
      {
          if (strlen($part) == 1)
          {
              switch ($part)
              {
                  case "[":
                  case "{":
                      $parts[$index] = "array(";
                      break;
                  case "]":
                  case "}":
                      $parts[$index] = ")";
                      break;
                  case ":":
                    $parts[$index] = "=>";
                    break;   
                  case ",":
                    break;
                  default:
                      return null;
              }
          }
          else
          {
              if ((substr($part, 0, 1) != "\"") || (substr($part, -1, 1) != "\""))
              {
                  return null;
              }
          }
      }
      $json = str_replace(array("&#92;", "&#34;", "$"), array("\\\\", "\\\"", "\\$"), implode("", $parts));
      return eval("return $json;");
    } 
	
	

	  public function importitemfromoracleAction()//importfromoracleAction()
  {
   
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		 $myfile = fopen($path.'log/import_from_oracle_log_item.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);	
		
		
		
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
						 
					   
						$param_array[1] = $params['DIVISION_CODE'];
					///$param_array[2] = $params['WAREHOUSE_CODE'];
						$param_array[2] = $params ['ITEM_CODE'];
						
						$param_array[3] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['DESCRIPTION']); 
						$param_array[3] = str_replace("'","",$param_array[3]);
						$param_array[3] = str_replace("Â","",$param_array[3]);
						$param_array[4] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['LONG_DESCRIPTION']); 
						$param_array[4] = str_replace("'","",$param_array[4]);
						$param_array[4] = str_replace("Â","",$param_array[4]);
						
						
					//$param_array[6] = $params['UOM'];
					  
						$param_array[5] = $params ['UNIT_SELLING_PRICE'];
						$param_array[6] = $params ['UNIT_SELLING_PRICE_PERUNIT'];
						
						$param_array[7] = $params ['RETURN_SELLING_PRICE_PERUNIT'];
						$param_array[8] = $params ['RETURN_PRICE'];
						
						//$param_array[11] = $params['FUTURE_USE1'];
						//$param_array[12] = $params['FUTURE_USE2'];
						$param_array[9] = $params ['BRAND_CODE'];
						$param_array[10] = $params ['CATEGORY_CODE'];
						$param_array[11] = $params ['SUB_CATEGORY_CODE'];
						//$param_array[12] = $params['BARCODE'];
						$param_array[12] = $params['Barcode'];
						$param_array[13] = $params['UOM_RATE'];
						$param_array[14] = $params ['ITEM_STATUS'];
					 					$param_array[15] = $params['UOM'];
										//print_r($param_array);exit;
				//	$resultdata = $this->SFA_Comman->executequery('CALL sp_import_data_from_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
					//$resultdata = $this->SFA_Comman->executeimportquery('CALL sp_import_item_from_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
					
	$resultdata = $this->SFA_Comman->executequery('CALL sp_import_item_from_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');

					
					
					/*print_r($resultdata);exit;
					if($this->SFA_Comman->executequery('CALL sp_import_data_from_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'')){
				    echo "Data from oracle has imported successfully";exit;}
				else{
				echo "error";exit;}*/
				if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
  }
	
	
	  public function importcustomeroracleAction()
  {
	  
	    
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		 //print_r($pararminvoice);exit;
		$myfile = fopen($path.'log/import_from_oracle_log_customer.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);	
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$withstrip = iconv('UTF-8', 'UTF-8//IGNORE', $withstrip); //print_r($withstrip);exit;
				$params = json_decode($withstrip,true);	//print_r($params);exit;
				$ar=array();
				$arr22=array();
				
				 ///echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					   
						$param_array[1] = $params['Division_Code'];
						$param_array[2] = $params['CustomerCode'];
						$param_array[3] = $params['HeadOfficeCode'];
						$param_array[4] = $params['RouteCode'];
						$param_array[5] = $params['CustType'];
						$param_array[6] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['CustomerName']); 
						$param_array[6] = str_replace("'","",$param_array[6]);
						$param_array[6] = str_replace("Â","",$param_array[6]);
						$param_array[6] = str_replace("	"," ",$param_array[6]);
						//$param_array[7] = $params['CustomerAddress1'];
						$param_array[7] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['CustomerAddress1']); 
						$param_array[7] = str_replace("'","",$param_array[7]);
						$param_array[7] = str_replace("Â","",$param_array[7]);
						$param_array[7] = str_replace("	"," ",$param_array[7]);
						//$param_array[8] = $params['CustomerAddress2'];
						$param_array[8] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['CustomerAddress2']); 
						$param_array[8] = str_replace("'","",$param_array[8]);
						$param_array[8] = str_replace("Â","",$param_array[8]);
						$param_array[8] = str_replace("	"," ",$param_array[8]);
						//$param_array[9] = $params['CustomerAddress3'];
						$param_array[9] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['CustomerAddress3']); 
						$param_array[9] = str_replace("'","",$param_array[9]);
						$param_array[9] = str_replace("Â","",$param_array[9]);
						$param_array[9] = str_replace("	"," ",$param_array[9]);
						//$param_array[10] = $params['ContactName'];
						$param_array[10] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['ContactName']); 
						$param_array[10] = str_replace("'","",$param_array[10]);
						$param_array[10] = str_replace("Â","",$param_array[10]);
						$param_array[10] = str_replace("	"," ",$param_array[10]);
						
						
						
						$param_array[11] = $params['InvoicePaymentTerms'];
						$param_array[12] = $params['CreditLimit'];
						$param_array[13] = $params['GracePeriod'];
						$param_array[14] = $params['Active'];
						$param_array[15] = $params['PricingKey'];
						$param_array[16] = $params['Memo1'];
						$param_array[17] = $params['Memo2'];
						$param_array[18] = $params['Territory'];
						$param_array[19] = $params['Class'];
						$param_array[20] = $params['Region'];
						$param_array[21] = $params['Transaction_Anals3'];
						$param_array[22] = $params['Grouping_Code'];
						$param_array[23] = $params['Outlet_Quality'];
						$param_array[24] = $params['OrderLocation'];
						$param_array[25] = $params['Credit_Days'];
						$param_array[26] = $params['CreditTerms'];
 //print_r($param_array);exit;
						// $this->SFA_Comman->executeimportquery('CALL sp_import_data_from_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');			 
					$resultdata =            $this->SFA_Comman->executequery('CALL sp_import_customer_from_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
					// print_r($resultdata);
					/*if($this->SFA_Comman->executequery('CALL sp_import_data_from_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'')){
				    echo "Data from oracle has imported successfully";exit;}
				else{
				echo "error";exit;}*/
				
		if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
  }
	
		public function testlogAction()
  {
//$myfile = fopen($path.'log/test_log.txt', "a") or die("Unable to open file!");print_r($myfile);
$url='log/test_log.json';
$data = file_get_contents($url); // put the contents of the file into a variable
$characters = json_decode($data); // decode the JSON feed
//print_r($characters);exit;
foreach($characters as $characters)
{
	//echo $characters->invoice_number."\n";
						$param_array 	= array();
					    $param_array[1] = 	$characters->invoice_number;
						$param_array[2] = 	$characters->route_code;
						$param_array[3] = 	$characters->salesman_code;
						$param_array[4] = 	$characters->transaction_date;
						$param_array[5] = 	$characters->customer_code;
						$param_array[6] = 	$characters->total_invoice_amount;
						$param_array[7] = 	$characters->invoice_balance;
						$param_array[8] = 	$characters->payment_type;
						$param_array[9] = 	$characters->pdc_indicator;
						$param_array[10] = 	$characters->refernce;
						$param_array[11] = 	$characters->analysis_codes2;
						$param_array[12] = 	$characters->cust_type;
						print_r($param_array);exit;
	$resultdata = $this->SFA_Comman->executequery('CALL sp_import_customer_outstanding_oracle(?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
		    if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
}

}	
		public function importcustomeroutstandingoracleAction()
  {
	  
	     header('Content-type: application/json');
	    
	  
	  
	    //*********************** to create log -- starts from here ***********************
	
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		/*$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);*/
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		$myfile = fopen($path.'log/import_from_oracle_log_customerOutstanding.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);	
		
							 
							 
 
		
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    //str_replace("'","","jul'18 jun''''''e'18")
						$param_array[1] = 	str_replace("'","",$params['invoice_number']);
						$param_array[2] = 	str_replace("'","",$params['route_code']);
						$param_array[3] = 	str_replace("'","",$params['salesman_code']);
						$param_array[4] = 	str_replace("'","",$params['transaction_date']);
						$param_array[5] = 	str_replace("'","",$params['customer_code']);
						$param_array[6] = 	str_replace("'","",$params['total_invoice_amount']);
						$param_array[7] = 	str_replace("'","",$params['invoice_balance']);
						$param_array[8] = 	str_replace("'","",$params['payment_type']);
						$param_array[9] = 	str_replace("'","",$params['pdc_indicator']);
						$param_array[10] = 	str_replace("'","",$params['refernce']);
						$param_array[11] = 	str_replace("'","",$params['analysis_codes2']);
						$param_array[12] = 	str_replace("'","",$params['cust_type']);
  
								 
								
   
   
								 
					/*$resultdata = $this->SFA_Comman->executequery('CALL sp_import_customer_outstanding_oracle(?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
					
								 $myfile = fopen($path.'log/import_from_oracle_log_after_procedure.txt', "a") or die("Unable to open file!");
 $txt =$params['invoice_number']." :";
  fwrite($myfile, $txt.print_r($resultdata, true)." \n");
   fclose($myfile);	
//print_r($param_array);exit;
			if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					*/
					
					
		$db_name     = Zend_Registry::get('config')->resources->multidb->front_db->dbname;
        $username     = Zend_Registry::get('config')->resources->multidb->front_db->username;
        $password     = Zend_Registry::get('config')->resources->multidb->front_db->password;
        $host         = Zend_Registry::get('config')->resources->multidb->front_db->host;
        
               
        $mysqli = new mysqli($host,$username , $password, $db_name);
        
        if (mysqli_connect_errno()) {
			echo   json_encode(array(        
					'Status' => "Connect failed: <p>%s</p>".mysqli_connect_error()
					));exit;
           
        }
		else
		{
			mysqli_query("SET NAMES 'utf8'"); 
	        mysqli_query('SET CHARACTER SET utf8');
			
			 
			
					
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/log/');
             
        
        
   
   
		 if (!$res=$mysqli->query("CALL  sp_import_customer_outstanding_oracle('".$param_array[1]."','".$param_array[2]."','".$param_array[3]."','".$param_array[4]."','".$param_array[5]."','".$param_array[6]."','".$param_array[7]."','".$param_array[8]."','".$param_array[9]."','".$param_array[10]."','".$param_array[11]."','".$param_array[12]."')")) {
            
			$filename = $path.'/customeroutstanding_error_log_'.date('Ymd').'.txt';
		 $myfile = fopen( $filename, "a") or die("Unable to open file!");
 $txt =$param_array[1]." : CALL failed: (" . $mysqli->errno . ") " . $mysqli->error."\n";
  fwrite($myfile, $txt);
   fclose($myfile);	
   
			echo   json_encode(array(        
					'Status' => "CALL failed: (" . $mysqli->errno . ") " . $mysqli->error
					));exit;
           }
		   else
		   {
			   
			   $filename = $path.'/customeroutstanding_success_log_'.date('Ymd').'.txt';
		 $myfile = fopen( $filename, "a") or die("Unable to open file!");
 $txt =$param_array[1].": success \n";
  fwrite($myfile, $txt);
   fclose($myfile);	
   
			 echo   json_encode(array(        
					'Status' => "success"
					));exit;  
		   }

 
mysqli_close($mysqli);
      
        
		
		} // db connection
		
		
					} // param foreach
				 
				
	  
	}// param count>0
		

	//***********************  Reading the json data passed , and inserting ends here ***********************
	
		
		
  }
  	public function importroutesalesmanoracleAction()
	{
	  
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		$myfile = fopen($path.'log/import_from_oracle_log_salesmanoracle.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);
		
		
		
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
						$param_array[1] = 	$params['division'];
						$param_array[2] = 	$params['routecode'];
						$param_array[3] = 	$params['routename'];
						$param_array[4] = 	$params['salesmancode'];
						$param_array[5] = 	$params['salesmanname'];
						//$param_array[5] = 	$params['salesmanname'];
						$param_array[5] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['salesmanname']); 
						$param_array[5] = str_replace("'","",$param_array[5]);
						$param_array[5] = str_replace("Â","",$param_array[5]);
						$param_array[6] = 	$params['whcode'];
						$param_array[7] = 	$params['mainwh'];
						$param_array[8] = 	$params['routetype'];
						$param_array[9] = 	$params['status'];

 
 
								 
					$resultdata = $this->SFA_Comman->executeimportquery('CALL sp_import_route_salesman_oracle(?,?,?,?,?,?,?,?,?)',$param_array,'');
					 

			if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
		

	//***********************  Reading the json data passed , and inserting ends here ***********************
	
		
		
  }
  
  public function importwarehousestockoracleAction()
	{
		
	  
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		$myfile = fopen($path.'log/import_from_oracle_log_warehousestock.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
						$param_array[1] = 	$params['warehouse_code'];
						$param_array[2] = 	$params['sub_inventory'];
						$param_array[3] = 	$params['item_code'];
						$param_array[4] = 	$params['physical_qty'];


 
 
								 
					 $resultdata = $this->SFA_Comman->executeimportquery('CALL sp_import_warehousestock_oracle(?,?,?,?)',$param_array,'');
					//$resultdata = $this->SFA_Comman->executequery('CALL sp_import_warehousestock_oracle(?,?,?,?)',$param_array,''); 
					 

			 if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
		

	//***********************  Reading the json data passed , and inserting ends here ***********************
	
		
		
  }
  
  
  public function importsalesmanstockoracleAction()
  {
	  
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		$myfile = fopen($path.'log/import_from_oracle_log_salesmanstock.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
						$param_array[1] = 	$params['date_received'];
						$param_array[2] = 	$params['subinventory_code'];
						$param_array[3] = 	$params['item_code'];
						$param_array[4] = 	$params['issued_qty'];
						$param_array[5] = 	$params['erp_transfer_number'];
						$param_array[6] = 	$params['routecode'];



 
 //print_r($param_array);exit;
								 
					 $resultdata = $this->SFA_Comman->executeimportquery('CALL sp_import_salesmanstock_oracle(?,?,?,?,?,?)',$param_array,'');
					// $resultdata = $this->SFA_Comman->executequery('CALL sp_import_salesmanstock_oracle(?,?,?,?,?,?)',$param_array,'');
					 

			 if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
		

	//***********************  Reading the json data passed , and inserting ends here ***********************
	
		
		
  }
  
  
  	
  	public function importpricingkeyoracleAction()
  {
	   
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
			$myfile = fopen($path.'log/import_from_oracle_log_pricingkey.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
				 
						
						$param_array[1] = 	$params['pricing_key'];
						$param_array[2] = 	$params['item_code'];
						//$param_array[3] = 	$params['description'];
						
						$param_array[3] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['description']); 
						$param_array[3] = str_replace("'","",$param_array[3]);
						$param_array[3] = str_replace("Â","",$param_array[3]);
						
						
						$param_array[4] = 	$params['start_date'];
						$param_array[5] = 	$params['end_date'];
						$param_array[6] = 	$params['special_case_price'];
						$param_array[7] = 	$params['special_piece_price'];
						$param_array[8] = 	$params['special_return_case_price'];
						$param_array[9] = 	$params['special_return_price'];
						$param_array[10] = 	$params['price_list_status'];
						$param_array[11] = 	$params['uom'];
						$param_array[12] = 	$params['uom_rate'];
 
 //print_r($param_array);exit;
								 
			$resultdata = $this->SFA_Comman->executeimportquery('CALL sp_import_pricing_key_oracle(?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
					 

			 if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
		

	//***********************  Reading the json data passed , and inserting ends here ***********************
  
  }
  
  
  
  public function importsalesorderoracleAction()
  {
	   
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		$myfile = fopen($path.'log/import_from_oracle_log_salesorder.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
				 
						
						$param_array[1] = 	$params['sales_man'];
						$param_array[2] = 	$params['route_code'];
						$param_array[3] = 	$params['customer_code'];
					//	$param_array[4] = 	$params['customer_name'];
						$param_array[4] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $params ['customer_name']); 
						$param_array[4] = str_replace("'","",$param_array[4]);
						$param_array[4] = str_replace("Â","",$param_array[4]);
						$param_array[5] = 	$params['order_number'];
						$param_array[6] = 	$params['order_date'];
						$param_array[7] = 	$params['invoice_no'];
						$param_array[8] = 	$params['invoice_date'];
						$param_array[9] = 	$params['difference_amount'];
						$param_array[10] = 	$params['order_status'];
						$param_array[11] = 	$params['alternate_code'];
						$param_array[12] = 	$params['alternate_order_number'];
						$param_array[13] = 	$params['alternate_invoice_number'];
						$param_array[14] = 	$params['difference_date'];
						
						
			
 
 
 //print_r($param_array);exit;
								 
		 $resultdata = $this->SFA_Comman->executeimportquery('CALL sp_import_sales_order_status_oracle(?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
					 //print_r($resultdata);exit;

			if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
		

	 
  
  }
  
  
   public function importdivisionmasterAction()
  {
	   
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		$myfile = fopen($path.'log/import_from_oracle_log_divisionmaster.txt', "a") or die("Unable to open file!");
 $txt =$pararminvoice;
  fwrite($myfile, $txt);
   fclose($myfile);
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
				 
						
						$param_array[1] = 	$params['id'];
						$param_array[2] = 	$params['name'];

						
						
			
 		 $resultdata = $this->SFA_Comman->executeimportquery('CALL sp_import_divisionmaster_oracle(?,?)',$param_array,'');
					 //print_r($resultdata);exit;

			if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
 
 
				header('Content-Type: application/json');
				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
		

	 
  
  }
  
  public function getsalesorderfromroutepro1Action()
  {
	   
		//*********************** to create log -- starts from here ***********************
	 
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		$result = array();
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_get_salesorder()','','');
			
			
			$result['DEVICE_NAME'] 				= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
			$result['DIVISON'] 					= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
			$result['CUSTOMER_NUMBER'] 			= (count($resultdata[2]) > 0) ? $resultdata[2]:array();
			$result['ORDER_NUMBER'] 			= (count($resultdata[3]) > 0) ? $resultdata[3]:array();
			$result['INVOICE_NUMBER'] 			= (count($resultdata[4]) > 0) ? $resultdata[4]:array();
			$result['VAN_NO'] 					= (count($resultdata[5]) > 0) ? $resultdata[5]:array();
			$result['SALES_PERSON_NAME'] 			= (count($resultdata[6]) > 0) ? $resultdata[6]:array();
			$result['ORDERED_DATE'] 			= (count($resultdata[7]) > 0) ? $resultdata[7]:array();
			$result['ORDER_TYPE'] 				= (count($resultdata[8]) > 0) ? $resultdata[8]:array();
			$result['ORDER_CATEGORY_CODE'] 			= (count($resultdata[9]) > 0) ? $resultdata[9]:array();
			$result['PRICE_LIST'] 				= (count($resultdata[10]) > 0) ? $resultdata[10]:array();
			$result['CURRENCY_CODE'] 			= (count($resultdata[11]) > 0) ? $resultdata[11]:array();
			$result['WAREHOUSE_CODE'] 			= (count($resultdata[12]) > 0) ? $resultdata[12]:array();
			$result['HEADER_DISCOUNT'] 			= (count($resultdata[13]) > 0) ? $resultdata[13]:array();
			$result['LINE_NO'] 					= (count($resultdata[14]) > 0) ? $resultdata[14]:array();
			$result['ORDERED_ITEM'] 			= (count($resultdata[15]) > 0) ? $resultdata[15]:array();
			$result['ORDERED_QTY'] 				= (count($resultdata[16]) > 0) ? $resultdata[16]:array();
			$result['ITEM_UOM'] 				= (count($resultdata[17]) > 0) ? $resultdata[17]:array();
			$result['UNIT_SELLING_PRICE'] 			= (count($resultdata[18]) > 0) ? $resultdata[18]:array();
			$result['LINE_LEVEL_DISCOUNT'] 			= (count($resultdata[19]) > 0) ? $resultdata[19]:array();
			$result['SUBINVENTORY_CODE'] 			= (count($resultdata[20]) > 0) ? $resultdata[20]:array();
			$result['BATCH_EXPIRY_DATE'] 			= (count($resultdata[21]) > 0) ? $resultdata[21]:array();
			$result['RETURN_REASON_CODE'] 			= (count($resultdata[22]) > 0) ? $resultdata[22]:array();

			  header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
		//echo str_replace(array('[', ']'), '', htmlspecialchars(json_encode($resultdata), ENT_NOQUOTES));
      //echo json_encode($resultdata[0]);
	     
			foreach($resultdata[0] as $key => $value)
{
	
	 
	//echo "///**";
	//echo strtotime($value[$key]['ORDERED_DATE']);echo "///";
	//echo $value[$key]['ORDERED_DATE'];echo "///";
	
	//echo $value['ORDERED_DATE'];
	//echo $resultdata[0][$key]['ORDERED_DATE'];echo "///";print_r($resultdata[$key]);echo "///";exit;
	 
  $resultdata[0][$key]['ORDERED_DATE'] = date('Y-m-d',strtotime($value['ORDERED_DATE']));
  if($value['BATCH_EXPIRY_DATE']=='0000-00-00 00:00:00'){$resultdata[0][$key]['BATCH_EXPIRY_DATE'] ="" ;}
  else{$resultdata[0][$key]['BATCH_EXPIRY_DATE'] = date('Y-m-d',strtotime($value['BATCH_EXPIRY_DATE']));}
  
  if($value['WAREHOUSE_CODE']=='0'){$resultdata[0][$key]['WAREHOUSE_CODE'] ="" ;}
  
    if($value['HEADER_DISCOUNT']=='0.0000'){$resultdata[0][$key]['HEADER_DISCOUNT'] ="0" ;}
  else{$resultdata[0][$key]['HEADER_DISCOUNT'] = round($value['HEADER_DISCOUNT'],3);}
  
    if($value['UNIT_SELLING_PRICE']=='0.0000'){$resultdata[0][$key]['UNIT_SELLING_PRICE'] ="0" ;}
  else{$resultdata[0][$key]['UNIT_SELLING_PRICE'] = round($value['UNIT_SELLING_PRICE'],3);}

   if($value['LINE_LEVEL_DISCOUNT']=='0.0000'){$resultdata[0][$key]['LINE_LEVEL_DISCOUNT'] ="0" ;}
  else{$resultdata[0][$key]['LINE_LEVEL_DISCOUNT'] = round($value['LINE_LEVEL_DISCOUNT'],3);}


  
}
echo json_encode($resultdata[0]);
//print_r($resultdata);
  }
   
  
   public function updateorderpoststatusAction()
  {
	   
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    	
						$param_array[1] = 	$params['INVOICENUMBER'];
						

						
						
			
 		 $resultdata = $this->SFA_Comman->executeimportquery('CALL sp_update_order_posted_status(?)',$param_array,'');
					 //print_r($resultdata);exit;

			if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
 
 

				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
	
		

	 
  
  }
  
  public function getsalesinvoicefromrouteproAction()
  {
	  
		//*********************** to create log -- starts from here ***********************
	 
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
				$param_array 	= array();
		$reqval= $this->getRequest()->getParams();
	$param_array[1]="";
	   if($param_array[1] = $reqval[TransactionDate])
	   {
		 $param_array[1] = DateTime::createFromFormat('Ymd', $param_array[1]);
		$param_array[1] = $param_array[1]->format('Y-m-d');  
	   }else
			{
				echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
			}
		
		// echo $param_array[1] ;exit;
			if($param_array[1]!="")
				{
					
					$result = array();
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_get_salesInvoice(?)',$param_array,'');
			}
			else
			{
				echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
			}
	 
			
			
			$result['DEVICE_NAME'] 				= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
			$result['DIVISON'] 					= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
			$result['CUSTOMER_NUMBER'] 			= (count($resultdata[2]) > 0) ? $resultdata[2]:array();
			$result['ORDER_NUMBER'] 			= (count($resultdata[3]) > 0) ? $resultdata[3]:array();
			$result['INVOICE_NUMBER'] 			= (count($resultdata[4]) > 0) ? $resultdata[4]:array();
			$result['VAN_NO'] 					= (count($resultdata[5]) > 0) ? $resultdata[5]:array();
			$result['SALES_PERSON_NAME'] 			= (count($resultdata[6]) > 0) ? $resultdata[6]:array();
			$result['ORDERED_DATE'] 			= (count($resultdata[7]) > 0) ? $resultdata[7]:array();
			$result['ORDER_TYPE'] 				= (count($resultdata[8]) > 0) ? $resultdata[8]:array();
			$result['ORDER_CATEGORY_CODE'] 			= (count($resultdata[9]) > 0) ? $resultdata[9]:array();
			$result['PRICE_LIST'] 				= (count($resultdata[10]) > 0) ? $resultdata[10]:array();
			$result['CURRENCY_CODE'] 			= (count($resultdata[11]) > 0) ? $resultdata[11]:array();
			$result['WAREHOUSE_CODE'] 			= (count($resultdata[12]) > 0) ? $resultdata[12]:array();
			$result['HEADER_DISCOUNT'] 			= (count($resultdata[13]) > 0) ? $resultdata[13]:array();
			$result['LINE_NO'] 					= (count($resultdata[14]) > 0) ? $resultdata[14]:array();
			$result['ORDERED_ITEM'] 			= (count($resultdata[15]) > 0) ? $resultdata[15]:array();
			$result['ORDERED_QTY'] 				= (count($resultdata[16]) > 0) ? $resultdata[16]:array();
			$result['ITEM_UOM'] 				= (count($resultdata[17]) > 0) ? $resultdata[17]:array();
			$result['UNIT_SELLING_PRICE'] 			= (count($resultdata[18]) > 0) ? $resultdata[18]:array();
			$result['LINE_LEVEL_DISCOUNT'] 			= (count($resultdata[19]) > 0) ? $resultdata[19]:array();
			$result['SUBINVENTORY_CODE'] 			= (count($resultdata[20]) > 0) ? $resultdata[20]:array();
			$result['BATCH_EXPIRY_DATE'] 			= (count($resultdata[21]) > 0) ? $resultdata[21]:array();
			$result['RETURN_REASON_CODE'] 			= (count($resultdata[22]) > 0) ? $resultdata[22]:array();

			  header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
		
		
		
		
 
  
 
 
		foreach($resultdata[0] as $key => $value)
{
	
	 
	//echo "///**";
	//echo strtotime($value[$key]['ORDERED_DATE']);echo "///";
	//echo $value[$key]['ORDERED_DATE'];echo "///";
	
	//echo $value['ORDERED_DATE'];
	//echo $resultdata[0][$key]['ORDERED_DATE'];echo "///";print_r($resultdata[$key]);echo "///";exit;
	 
  $resultdata[0][$key]['ORDERED_DATE'] = date('Y-m-d',strtotime($value['ORDERED_DATE']));
  if($value['BATCH_EXPIRY_DATE']=='0000-00-00 00:00:00'){$resultdata[0][$key]['BATCH_EXPIRY_DATE'] ="" ;}
  else{$resultdata[0][$key]['BATCH_EXPIRY_DATE'] = date('Y-m-d',strtotime($value['BATCH_EXPIRY_DATE']));}
  
  if($value['WAREHOUSE_CODE']=='0'){$resultdata[0][$key]['WAREHOUSE_CODE'] ="" ;}
  
    if($value['HEADER_DISCOUNT']=='0.0000'){$resultdata[0][$key]['HEADER_DISCOUNT'] ="0" ;}
  else{$resultdata[0][$key]['HEADER_DISCOUNT'] = round($value['HEADER_DISCOUNT'],3);}
  
    if($value['UNIT_SELLING_PRICE']=='0.0000'){$resultdata[0][$key]['UNIT_SELLING_PRICE'] ="0" ;}
  else{$resultdata[0][$key]['UNIT_SELLING_PRICE'] = round($value['UNIT_SELLING_PRICE'],3);}
//  else{$resultdata[0][$key]['UNIT_SELLING_PRICE'] = strval(round($value['UNIT_SELLING_PRICE'],3));}
   if($value['LINE_LEVEL_DISCOUNT']=='0.0000'){$resultdata[0][$key]['LINE_LEVEL_DISCOUNT'] ="0" ;}
  else{$resultdata[0][$key]['LINE_LEVEL_DISCOUNT'] = round($value['LINE_LEVEL_DISCOUNT'],3);}


  
}
		
		
		
		
		echo json_encode($resultdata[0] );
		
	//	$myJsonString=json_encode($resultdata[0] );
		//$myNewJsonString = preg_replace('/"UNIT_SELLING_PRICE"\s*:\s*(\d+)/', '"UNIT_SELLING_PRICE": "\1"', $myJsonString);
		//echo $myNewJsonString;
			
  }
  
   public function updateinvoicepoststatusAction()
  {
	   
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
				 
						
						$param_array[1] = 	$params['INVOICENUMBER'];
						

						
						
			
 		 $resultdata = $this->SFA_Comman->executeimportquery('CALL sp_update_invoice_posted_status(?)',$param_array,'');
					 //print_r($resultdata);exit;

			if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
 
 

				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
	 
  }
  
  /*public function getreceiptfromrouteproAction()
  {
	   
		//*********************** to create log -- starts from here ***********************
	 
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		$result = array();
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_get_receipts()','','');
			
$result['DEVICE_NAME'] 			= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
$result['DIVISON'] 			= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
$result['CUSTOMER_NUMBER'] 			= (count($resultdata[2]) > 0) ? $resultdata[2]:array();
$result['INVOICE_NUMBER'] 			= (count($resultdata[3]) > 0) ? $resultdata[3]:array();
$result['INVOICE_AMOUNT'] 			= (count($resultdata[4]) > 0) ? $resultdata[4]:array();
$result['RECEIPT_AMOUNT'] 			= (count($resultdata[5]) > 0) ? $resultdata[5]:array();
$result['PAYMENT_MODE'] 			= (count($resultdata[6]) > 0) ? $resultdata[6]:array();
$result['RECEIPT_NUMBER'] 			= (count($resultdata[7]) > 0) ? $resultdata[7]:array();
$result['CHECK_NUMBER'] 			= (count($resultdata[8]) > 0) ? $resultdata[8]:array();
$result['RECEIPT_DATE'] 			= (count($resultdata[9]) > 0) ? $resultdata[9]:array();


		
			  header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
		//echo str_replace(array('[', ']'), '', htmlspecialchars(json_encode($resultdata), ENT_NOQUOTES));
        //echo json_encode($resultdata);
		
		
	     
			foreach($resultdata[0] as $key => $value)
{
	
	if($value['INVOICE_AMOUNT']=='0.0000'){$resultdata[0][$key]['INVOICE_AMOUNT'] ="0" ;}
  else{$resultdata[0][$key]['INVOICE_AMOUNT'] = round($value['INVOICE_AMOUNT'],3);}
	
	if($value['RECEIPT_AMOUNT']=='0.0000'){$resultdata[0][$key]['RECEIPT_AMOUNT'] ="0" ;}
  else{$resultdata[0][$key]['RECEIPT_AMOUNT'] = round($value['RECEIPT_AMOUNT'],3);}
	
	 if($value['RECEIPT_DATE']=='0000-00-00 00:00:00'){$resultdata[0][$key]['RECEIPT_DATE'] ="" ;}
  else{$resultdata[0][$key]['RECEIPT_DATE'] = date('Y-m-d',strtotime($value['RECEIPT_DATE']));}
}
		echo json_encode($resultdata[0]);
			
  }*/
  //sp_export_loadrequest
   public function getloadrequestfromrouteproAction()
  {
	   
		//*********************** to create log -- starts from here ***********************
	 
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		$param_array 	= array();
		$reqval= $this->getRequest()->getParams();
		$param_array[1]="";
	    if($param_array[1] = $reqval[TransactionDate])
		{
			$param_array[1] = DateTime::createFromFormat('Ymd', $param_array[1]);
			$param_array[1] = $param_array[1]->format('Y-m-d');  
		}
		else
		{
			echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
		}
		if($param_array[1]!="")
		{
			$result = array();
			$resultdata = $this->SFA_Comman->executequery('CALL sp_get_loadrequest(?)',$param_array,'');
		}
		else
		{
			echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
		}
		
		 		 if (!$resultdata)
				 {
					 echo '[{"Message":"No data"}]';
					 exit;
				 }
				 
		$result['ORG_CODE'] 				= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
		$result['TO_SUBINV_CODE'] 			= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
		$result['ITEMCODE'] 			= (count($resultdata[2]) > 0) ? $resultdata[2]:array();
		$result['UOM_CODE'] 			= (count($resultdata[3]) > 0) ? $resultdata[3]:array();
		$result['QUANTITY'] 			= (count($resultdata[4]) > 0) ? $resultdata[4]:array();
		$result['HHTReference'] 			= (count($resultdata[5]) > 0) ? $resultdata[5]:array();
		$result['DateRequired'] 			= (count($resultdata[6]) > 0) ? $resultdata[6]:array();
		 
		
		header("Access-Control-Allow-Origin: *");
        array_walk_recursive($result,'replacenul');
		foreach($resultdata[0] as $key => $value)
		{
	
		 
		if($value['DateRequired']=='0000-00-00 00:00:00'){$resultdata[0][$key]['DateRequired'] ="" ;}
		else{$resultdata[0][$key]['DateRequired'] = date('Y-m-d',strtotime($value['DateRequired']));}
		}
		echo json_encode($resultdata[0]);
			
  }
   public function getreceiptfromrouteproAction()
  {
	   
		//*********************** to create log -- starts from here ***********************
	 
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		$param_array 	= array();
		$reqval= $this->getRequest()->getParams();
		$param_array[1]="";
	    if($param_array[1] = $reqval[TransactionDate])
		{
			$param_array[1] = DateTime::createFromFormat('Ymd', $param_array[1]);
			$param_array[1] = $param_array[1]->format('Y-m-d');  
		}
		else
		{
			echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
		}
		if($param_array[1]!="")
		{
			$result = array();
			$resultdata = $this->SFA_Comman->executequery('CALL sp_get_receipts(?)',$param_array,'');
		}
		else
		{
			echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
		}
		
		 		 if (!$resultdata)
				 {
					 echo '[{"Message":"No data"}]';
					 exit;
				 }
		$result['DEVICE_NAME'] 				= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
		$result['DIVISON'] 					= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
		$result['CUSTOMER_NUMBER'] 			= (count($resultdata[2]) > 0) ? $resultdata[2]:array();
		$result['INVOICE_NUMBER'] 			= (count($resultdata[3]) > 0) ? $resultdata[3]:array();
		$result['INVOICE_AMOUNT'] 			= (count($resultdata[4]) > 0) ? $resultdata[4]:array();
		$result['RECEIPT_AMOUNT'] 			= (count($resultdata[5]) > 0) ? $resultdata[5]:array();
		$result['PAYMENT_MODE'] 			= (count($resultdata[6]) > 0) ? $resultdata[6]:array();
		$result['RECEIPT_NUMBER'] 			= (count($resultdata[7]) > 0) ? $resultdata[7]:array();
		$result['CHECK_NUMBER'] 			= (count($resultdata[8]) > 0) ? $resultdata[8]:array();
		$result['RECEIPT_DATE'] 			= (count($resultdata[9]) > 0) ? $resultdata[9]:array();
		// Added by shine as per the requirement from Sandeeep May 12 2019
		$result['CHECK_DATE'] 			= (count($resultdata[10]) > 0) ? $resultdata[10]:array();
		$result['HHT_BANK_NAME'] 			= (count($resultdata[11]) > 0) ? $resultdata[11]:array();
		// Added By Shine as per the request on Nov 14 2019
		//$result['COMMENTS'] 			= (count($resultdata[11]) > 0) ? $resultdata[12]:array();
		
		
		header("Access-Control-Allow-Origin: *");
        array_walk_recursive($result,'replacenul');
		foreach($resultdata[0] as $key => $value)
		{
	
		if($value['INVOICE_AMOUNT']=='0.0000'){$resultdata[0][$key]['INVOICE_AMOUNT'] ="0" ;}
		else{$resultdata[0][$key]['INVOICE_AMOUNT'] = round($value['INVOICE_AMOUNT'],3);}

		if($value['RECEIPT_AMOUNT']=='0.0000'){$resultdata[0][$key]['RECEIPT_AMOUNT'] ="0" ;}
		else{$resultdata[0][$key]['RECEIPT_AMOUNT'] = round($value['RECEIPT_AMOUNT'],3);}

		if($value['RECEIPT_DATE']=='0000-00-00 00:00:00'){$resultdata[0][$key]['RECEIPT_DATE'] ="" ;}
		else{$resultdata[0][$key]['RECEIPT_DATE'] = date('Y-m-d',strtotime($value['RECEIPT_DATE']));}
		$resultdata[0][$key]['RECEIPT_AMOUNT'] =(string)$resultdata[0][$key]['RECEIPT_AMOUNT'] ;
		 $resultdata[0][$key]['INVOICE_AMOUNT'] =(string)$resultdata[0][$key]['INVOICE_AMOUNT'] ;
		 if($value['CHECK_NUMBER']=='0'){$resultdata[0][$key]['CHECK_NUMBER'] ="" ;}
		}
		
			 
		 
		 
		
		 echo json_encode($resultdata[0]);
			 
  }
   public function updatereceiptpoststatusAction()
  {
	   
	    //*********************** to create log -- starts from here ***********************
	 
	    $reqval= $this->getRequest()->getParams();

        $resultreturn = array();    
		
		$baseUrl= Zend_Controller_Front::getInstance()->getBaseUrl();
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		$trtype ="";
		
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		
		
		//*********************** Reading the json data passed , and inserting starts here ***********************
		
	
		$pararminvoice=$this->getRequest()->getRawBody();
		//$pararminvoice=$this->_getParam();	
				$withstrip=(stripslashes($pararminvoice));
				$params = json_decode($withstrip,true);	
				$ar=array();
				$arr22=array();
				//echo count($params);exit;
				//print_r($params);exit;
			if(count($params)>0)
				{
					for($i=0;$i<count($params);$i++)
					{
						$param_array 	= array();
					    
				 
						
						$param_array[1] = 	$params['RECEIPT_NUMBER'];
						

						
						
			
 		 $resultdata = $this->SFA_Comman->executeimportquery('CALL sp_update_receipt_posted_status(?)',$param_array,'');
					 //print_r($resultdata);exit;

			if($resultdata[error]=="" )
				{
			if(count($resultdata)>=1){
				$val =array("Status"=>"Success");
				}else {
					$val =array("Status"=>"Failed");  
				}
				}else{
					$val =array("Status"=>$resultdata[error]);  
				}
 
 

				echo json_encode($val);
 			 exit;
					
					}
				 
				
	  
	}
	 
  }
  
  public function getsalesorderfromrouteproAction()
  {
  
  
		//*********************** to create log -- starts from here ***********************
	 
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		$param_array 	= array();
		$reqval= $this->getRequest()->getParams();
	$param_array[1]="";
	   if($param_array[1] = $reqval[TransactionDate])
	   {
		 $param_array[1] = DateTime::createFromFormat('Ymd', $param_array[1]);
		$param_array[1] = $param_array[1]->format('Y-m-d');  
	   }else
			{
				echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
			}
		
		// echo $param_array[1] ;exit;
			if($param_array[1]!="")
				{
					
					$result = array();
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_get_salesorder(?)',$param_array,'');
			}
			else
			{
				echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
			}
			
			$result['DEVICE_NAME'] 				= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
			$result['DIVISON'] 					= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
			$result['CUSTOMER_NUMBER'] 			= (count($resultdata[2]) > 0) ? $resultdata[2]:array();
			$result['ORDER_NUMBER'] 			= (count($resultdata[3]) > 0) ? $resultdata[3]:array();
			$result['INVOICE_NUMBER'] 			= (count($resultdata[4]) > 0) ? $resultdata[4]:array();
			$result['VAN_NO'] 					= (count($resultdata[5]) > 0) ? $resultdata[5]:array();
			$result['SALES_PERSON_NAME'] 			= (count($resultdata[6]) > 0) ? $resultdata[6]:array();
			$result['ORDERED_DATE'] 			= (count($resultdata[7]) > 0) ? $resultdata[7]:array();
			$result['ORDER_TYPE'] 				= (count($resultdata[8]) > 0) ? $resultdata[8]:array();
			$result['ORDER_CATEGORY_CODE'] 			= (count($resultdata[9]) > 0) ? $resultdata[9]:array();
			$result['PRICE_LIST'] 				= (count($resultdata[10]) > 0) ? $resultdata[10]:array();
			$result['CURRENCY_CODE'] 			= (count($resultdata[11]) > 0) ? $resultdata[11]:array();
			$result['WAREHOUSE_CODE'] 			= (count($resultdata[12]) > 0) ? $resultdata[12]:array();
			$result['HEADER_DISCOUNT'] 			= (count($resultdata[13]) > 0) ? $resultdata[13]:array();
			$result['LINE_NO'] 					= (count($resultdata[14]) > 0) ? $resultdata[14]:array();
			$result['ORDERED_ITEM'] 			= (count($resultdata[15]) > 0) ? $resultdata[15]:array();
			$result['ORDERED_QTY'] 				= (count($resultdata[16]) > 0) ? $resultdata[16]:array();
			$result['ITEM_UOM'] 				= (count($resultdata[17]) > 0) ? $resultdata[17]:array();
			$result['UNIT_SELLING_PRICE'] 			= (count($resultdata[18]) > 0) ? $resultdata[18]:array();
			$result['LINE_LEVEL_DISCOUNT'] 			= (count($resultdata[19]) > 0) ? $resultdata[19]:array();
			$result['SUBINVENTORY_CODE'] 			= (count($resultdata[20]) > 0) ? $resultdata[20]:array();
			$result['BATCH_EXPIRY_DATE'] 			= (count($resultdata[21]) > 0) ? $resultdata[21]:array();
			$result['RETURN_REASON_CODE'] 			= (count($resultdata[22]) > 0) ? $resultdata[22]:array();

			  header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
		//echo str_replace(array('[', ']'), '', htmlspecialchars(json_encode($resultdata), ENT_NOQUOTES));
      //echo json_encode($resultdata[0]);
	     
			foreach($resultdata[0] as $key => $value)
{
	
	 
	//echo "///**";
	//echo strtotime($value[$key]['ORDERED_DATE']);echo "///";
	//echo $value[$key]['ORDERED_DATE'];echo "///";
	
	//echo $value['ORDERED_DATE'];
	//echo $resultdata[0][$key]['ORDERED_DATE'];echo "///";print_r($resultdata[$key]);echo "///";exit;
	 
  $resultdata[0][$key]['ORDERED_DATE'] = date('Y-m-d',strtotime($value['ORDERED_DATE']));
  if($value['BATCH_EXPIRY_DATE']=='0000-00-00 00:00:00'){$resultdata[0][$key]['BATCH_EXPIRY_DATE'] ="" ;}
  else{$resultdata[0][$key]['BATCH_EXPIRY_DATE'] = date('Y-m-d',strtotime($value['BATCH_EXPIRY_DATE']));}
  
  if($value['WAREHOUSE_CODE']=='0'){$resultdata[0][$key]['WAREHOUSE_CODE'] ="" ;}
  
    if($value['HEADER_DISCOUNT']=='0.0000'){$resultdata[0][$key]['HEADER_DISCOUNT'] ="0" ;}
  else{$resultdata[0][$key]['HEADER_DISCOUNT'] = round($value['HEADER_DISCOUNT'],3);}
  
    if($value['UNIT_SELLING_PRICE']=='0.0000'){$resultdata[0][$key]['UNIT_SELLING_PRICE'] ="0" ;}
  else{$resultdata[0][$key]['UNIT_SELLING_PRICE'] = round($value['UNIT_SELLING_PRICE'],3);}

   if($value['LINE_LEVEL_DISCOUNT']=='0.0000'){$resultdata[0][$key]['LINE_LEVEL_DISCOUNT'] ="0" ;}
  else{$resultdata[0][$key]['LINE_LEVEL_DISCOUNT'] = round($value['LINE_LEVEL_DISCOUNT'],3);}


  
}
echo json_encode($resultdata[0]);
//print_r($resultdata);
  }
   public function getcreditnotefromrouteprooldAction()
  {
  
        
		//*********************** to create log -- starts from here ***********************
	 
		$path   = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].'/sfa/enhance_live/');		                         
		
		$filename = $path.'log/sync_log_'.date('Ymd').'.txt';
		
		if (!file_exists($filename)) {
			fopen($filename,'a');
		}
		chmod($filename,0777);
		
		$current = file_get_contents($filename);
		$current .= "\n";
		$post = $this->getRequest()->getParams();
		$current .= "\n".print_r($post,true)."\n";
		file_put_contents($filename, $current);
		
		//*********************** to create log -- Ends here ***********************
		$param_array 	= array();
		$reqval= $this->getRequest()->getParams();
	$param_array[1]="";
	 
	   if($param_array[1] = $reqval[TransactionDate])
	   {
		 $param_array[1] = DateTime::createFromFormat('Ymd', $param_array[1]);
		$param_array[1] = $param_array[1]->format('Y-m-d');  
	   }else
			{
				echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
			}
		
		// echo $param_array[1] ;exit;
			if($param_array[1]!="")
				{
					
					$result = array();
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_get_creditnote(?)',$param_array,'');
			}
			else
			{
				echo "Invalid URL Format. Pass Tansaction Date Also With The URL.";exit;
			}
			 
	 
			$result['DIVISON'] 				= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
			$result['CUSTOMER_CODE'] 					= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
			$result['TRX_DATE'] 			= (count($resultdata[2]) > 0) ? $resultdata[2]:array();
			$result['GL_DATE'] 			= (count($resultdata[3]) > 0) ? $resultdata[3]:array();
			$result['CREDIT_AMOUNT'] 			= (count($resultdata[4]) > 0) ? $resultdata[4]:array();
			$result['REF_INV_NUMBER'] 					= (count($resultdata[5]) > 0) ? $resultdata[5]:array();
			$result['COMMENTS'] 			= (count($resultdata[6]) > 0) ? $resultdata[6]:array();
			 

			  header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
		//echo str_replace(array('[', ']'), '', htmlspecialchars(json_encode($resultdata), ENT_NOQUOTES));
      //echo json_encode($resultdata[0]);
	     
			foreach($resultdata[0] as $key => $value)
{
	
	 
	//echo "///**";
	//echo strtotime($value[$key]['ORDERED_DATE']);echo "///";
	//echo $value[$key]['ORDERED_DATE'];echo "///";
	
	//echo $value['ORDERED_DATE'];
	//echo $resultdata[0][$key]['ORDERED_DATE'];echo "///";print_r($resultdata[$key]);echo "///";exit;
	 
  $resultdata[0][$key]['TRX_DATE'] = date('Y-m-d',strtotime($value['TRX_DATE']));
    $resultdata[0][$key]['GL_DATE'] = date('Y-m-d',strtotime($value['GL_DATE']));
   
 
  
    if($value['CREDIT_AMOUNT']=='0.0000'){$resultdata[0][$key]['CREDIT_AMOUNT'] ="0" ;}
  else{$resultdata[0][$key]['CREDIT_AMOUNT'] = round($value['CREDIT_AMOUNT'],3);}
  
  

  
}
if (count($resultdata[0])>0)
{
	

echo json_encode($resultdata[0]);
}
else{
	echo '{ }';
}
//print_r($resultdata);
  }
  
	
}
