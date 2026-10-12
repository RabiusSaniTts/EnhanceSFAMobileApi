<?php

class Api_WsController extends Api_Library_Controller_Action_Abstract
{

    //Initilize var for App Model
    private $index = "";

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
    }

  
  public function senddataAction(){
        
	
	$reqval= $this->getRequest()->getParams();    
    $resultreturn = array();
	
	if(!is_null($this->_getParam('startday')))
    {
   	$pararminvoice=$this->_getParam('startday');
    $params = json_decode($pararminvoice,true);

	$ar=array();
	if(count($params)>0)
	{
	    for($i=0;$i<count($params);$i++)
	    {
			$param_array 	= array();
			$param_array[1]	= $params[$i]['routecode'];
			$param_array[2]	= $params[$i]['salesmancode'];
			$param_array[3]	= $params[$i]['routestartodometer'];
			$param_array[4]	= $params[$i]['deviceid'];
			$param_array[5]	= $params[$i]['ver'];
			$param_array[6]	= $params[$i]['startdate']; // sujee added
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_stratendday(?,?,?,?,?,?)',$param_array,'');
		
			if($resultdata[0][0]['status'] == 1){
				$arr[]=array("status"=>1);
			} // sujee added to check  routestartdate 
			else if($resultdata[0][0]['status'] == 2)
			{
				$arr[]=array("status"=>2);
			}  // end 
			elseif(count($resultdata)>0) {
				$arr[]=array("status"=>0,"routekey"=>$resultdata[0][0]['routekey'],"routestartdate"=>$resultdata[0][0]['routestartdate'],"routestarttime"=>$resultdata[0][0]['routestarttime'],"routestartodometer"=>$resultdata[0][0]['routestartodometer']);
			}	    
	    }
	 
	    $resultreturn['startday'] = $arr;
	}else
	    {
		 $resultreturn['startday'] = array();
	    }
	    
    }
	
	echo json_encode($resultreturn);
	exit;
    }
    
    //For end day
    public function enddayAction()
    {
	
		$reqval= $this->getRequest()->getParams();
		$resultreturn = array();
		if(!is_null($this->_getParam('endday')))
	    {
		$pararminvoice=$this->_getParam('endday');	
		$params = json_decode($pararminvoice,true);
		$ar=array();
		if(count($params)>0)
		{
		    for($i=0;$i<count($params);$i++)
		    {
			$param_array 	= array();
			$param_array[1]	= $params[$i]['routekey'];
			$param_array[2]	= $params[$i]['routeenddate'];
			$param_array[3]	= $params[$i]['routeendtime'];
			$param_array[4]	= $params[$i]['routeendodometer'];
			$param_array[5] = $params[$i]['totaldocuments'];
			$param_array[6] = $params[$i]['totalcash'];
			$param_array[7] = $params[$i]['totalchecks'];			
			$param_array[8] = $params[$i]['totalorderamount'];
			$param_array[9] = $params[$i]['totalinvoiceamount'];
			$param_array[10] = $params[$i]['totalchargesales'];
			$param_array[11] = $params[$i]['totalcashsales'];
			$param_array[12] = $params[$i]['totalacctsreceivable'];
			$param_array[13] = $params[$i]['totalexpenses'];
			$param_array[14] = $params[$i]['inventoryvariance'];
			$param_array[15] = $params[$i]['cashvariance'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_from_tablet_endday(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');
     
			if(count($resultdata)>0)
			{
			    $arr[]=array("routekey"=>$resultdata[0][0]['routekey'],"routeenddate"=>$resultdata[0][0]['routeenddate'],"routeendtime"=>$resultdata[0][0]['routeendtime']);
			}		    
		    }
		 
		     $resultreturn['endday'] = $arr;
		}else
		    {
			 $resultreturn['endday'] = array();
		    }
		    
	    }
    }
    
     public function logoutAction()
    {	
		$reqval= $this->getRequest()->getParams();
	    $resultreturn = array();
		 if(!is_null($this->_getParam('logout')))
	    {
		$pararminvoice=$this->_getParam('logout');	
		$params = json_decode($pararminvoice,true);
		$ar=array();
		
		if(count($params)>0)
		{
		    for($i=0;$i<count($params);$i++)
		    {
			$param_array 	= array();
			$param_array[1]	= $params[$i]['routekey'];
			$param_array[2]	= $params[$i]['routecode'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_delete_routekey(?,?)',$param_array,'');		    
		    }
		 
		}else
		{
		// $resultreturn['endday'] = array();
		}
		    
	    }
    }
    
     public function checkloadAction()
    {	
		$reqval= $this->getRequest()->getParams();
		$this->view->params = $params = $this->getRequest()->getParams();

        $param_array = array();
		$param_array[1] =  $params['userid'];
        $param_array[2] = $params['routeid'];
	 
        $resultdata = $this->SFA_Comman->executequery('CALL sp_ws_tablet_check_load(?,?)',$param_array,'');

	if ($resultdata[0][0]['cnt']>0)
	{
	  echo  $flag='1';
	}else
	{
	   echo  $flag='0';
	}
	
    }
    
	//GPS
	public function routetrack11Action()
	{	
		$reqval= $this->getRequest()->getParams();
		$params = array();
		
		if(!is_null($this->_getParam('gpstrack')))
		{					
			$gpstrack=$this->_getParam('gpstrack');			
			$params = json_decode($gpstrack,true);
			
			if(count($params)>0)
			{
				for($i=0;$i<count($params);$i++)
				{
					$param_array = array();
					$param_array[1] = $params[$i]['lat'];
					$param_array[2] = $params[$i]['log'];
					$param_array[3] = $params[$i]['deviceid'];
					
					$result = $this->SFA_Comman->executequery('CALL sp_ws_getdata_from_routetrack(?,?,?)',$param_array,'');
				}
				
				$resultreturn['gpstrack'] = '1';
			}
			else
			{
			$resultreturn['gpstrack'] = '0';
			}
		} 	
		
		echo $resultdatacomp = $result[0];
		exit;
	}

	//GPS New api function with devicetimestamp Aswin - 01-06-2025
	public function routetrack21Action()
	{	
		$reqval= $this->getRequest()->getParams();
		$params = array();
		
		if(!is_null($this->_getParam('gpstrack')))
		{					
			$gpstrack=$this->_getParam('gpstrack');			
			$params = json_decode($gpstrack,true);
			
			if(count($params)>0)
			{
				for($i=0;$i<count($params);$i++)
				{
					$param_array = array();
					$param_array[1] = $params[$i]['lat'];
					$param_array[2] = $params[$i]['log'];
					$param_array[3] = $params[$i]['deviceid'];
					$param_array[4] = $params[$i]['timestamp'];
					
					$result = $this->SFA_Comman->executequery('CALL sp_ws_getdata_from_deviceroutetrack(?,?,?,?)',$param_array,'');
				}
				
				$resultreturn['gpstrack'] = '1';
			}
			else
			{
			$resultreturn['gpstrack'] = '0';
			}
		} 	
		
		echo $resultdatacomp = $result[0];
		exit;
	}
	
    public function getdeliveryAction()
    {
		$reqval= $this->getRequest()->getParams();
		$resultreturn = array();
		$ar=array();
		
		if(!is_null($this->_getParam('delivery')))
	    {
			$pararminvoice=$this->_getParam('delivery');	
			$params = json_decode($pararminvoice,true);
		
			if(count($params)>0)
			{
				$param_array 	= array();
				$param_array[1]	= $params[0]['customercode'];
				$param_array[2]	= $params[0]['orderdate'];
				$param_array[3]	= $params[0]['orderno'];
				$param_array[4]	= $params[0]['lpono'];
				$param_array[5]	= $params[0]['routecode'];
				
				$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_getdata_delivery(?,?,?,?,?)',$param_array,'');			 
							
				$ar['deliveryheader'] = (count($resultdata[0]) > 0) ? $resultdata[0]:array();
				$ar['deliverydetail'] = (count($resultdata[1]) > 0) ? $resultdata[1]:array();
				
				//$resultreturn['getdelivery'] = $ar;			
				array_walk_recursive($ar,'getdelivery');
				echo json_encode($ar);				
				
			}else
		    {
			 $resultreturn['getdelivery'] = array();
		    }
		    
	    }		
    }
	
	public function getwhstockAction()
    {
		$reqval= $this->getRequest()->getParams();
		$resultreturn = array();
		$ar=array();
		
		if(!is_null($this->_getParam('whstock')))
	    {
			$pararminvoice=$this->_getParam('whstock');	
			$params = json_decode($pararminvoice,true);
		
			if(count($params)>0)
			{
				$param_array 	= array();
				$param_array[1]	= $params[0]['routecode'];
				
				$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_getdata_whstock(?)',$param_array,'');			 
							
				$ar['whstock'] = (count($resultdata[0]) > 0) ? $resultdata[0]:array();
						
				array_walk_recursive($ar,'getwhstock');
				echo json_encode($ar);				
				
			}else
		    {
			 $resultreturn['getwhstock'] = array();
		    }
		    
	    }		
    }
	// sujee added 22/04/2018
	public function getcustinvAction()
    {
		$reqval= $this->getRequest()->getParams();
		$resultreturn = array();
		$ar=array();
		
		if(!is_null($this->_getParam('tempcustomerinventory')))
	    {
			$pararminvoice=$this->_getParam('tempcustomerinventory');	
			$params = json_decode($pararminvoice,true);
		
			if(count($params)>0)
			{
				for($i =0 ;$i<count($params);$i++){
				$param_array 	= array();
				$param_array[1]	= $params[$i]['routekey'];
				$param_array[2]	= $params[$i]['visitkey'];
				$param_array[3]	= $params[$i]['itemcode'];
				$param_array[4]	= $params[$i]['alternatecode'];
				$param_array[5]	= $params[$i]['customercode'];
				$param_array[6]	= $params[$i]['expirydate'];
				$param_array[7]	= $params[$i]['barcode'];
				$param_array[8]	= $params[$i]['quantity'];
				$param_array[9]	= $params[$i]['entryflag'];
				$param_array[10]= $params[$i]['routecode'];
				$param_array[11]= $params[$i]['salesmancode'];
				
				$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_get_from_tempcustomerinventory(?,?,?,?,?,?,?,?,?,?,?)',$param_array,'');			 
				}			
				array_walk_recursive($ar,'tempcustomerinventory');
				echo json_encode($ar);				
				
			}else
		    {
			 $resultreturn['tempcustomerinventory'] = array();
		    }
		    
	    }		
    }
	
	
	
	public function getcustomerbalanceAction()
    {
		$reqval= $this->getRequest()->getParams();
		$resultreturn = array();
		$ar=array();
		
		if(!is_null($this->_getParam('customerbalance')))
	    {
			$pararminvoice=$this->_getParam('customerbalance');	
			$params = json_decode($pararminvoice,true);
		
			if(count($params)>0)
			{
				$param_array 	= array();
				$param_array[1]	= $params[0]['routecode'];
				$param_array[2]	= $params[0]['customercode'];
				
				$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_getcustomer_balance(?)',$param_array,'');			 
							
				$ar['customerbalance'] = (count($resultdata[0]) > 0) ? $resultdata[0]:array();
						
				array_walk_recursive($ar,'customerbalance');
				echo json_encode($ar);				
				
			}else
		    {
			 $resultreturn['customerbalance'] = array();
		    }
		    
	    }		
    }
	public function getwarehousestockAction()
	{
		$result = array();
	
			
			 $reqval= $this->getRequest()->getParams();
			$this->view->params = $params = $this->getRequest()->getParams();

			$param_array = array();
			
			$param_array[1] =  $params['userid'];
			$param_array[2] = $params['routeid'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_tablet_get_warehousestock(?,?)',$param_array,'');
			
			$result['warehousestock']=  $resultdata[0];
			
            echo json_encode($result); 
   
	}
	
	// sujee added for order status
	
	public function getorderstatusAction()
	{
		$result = array();
	
			
			 $reqval= $this->getRequest()->getParams();
			$this->view->params = $params = $this->getRequest()->getParams();

			$param_array = array();
			
			$param_array[1] =  $params['userid'];
			$param_array[2] = $params['routeid'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_tablet_get_deliveryorderstatus(?,?)',$param_array,'');
			
			$result['orderstatus']=  $resultdata[0];
			
            echo json_encode($result); 
   
	}
	public function getcustomeritemgrpAction()
	{
		$result = array();
	
			
			$reqval= $this->getRequest()->getParams();
			$this->view->params = $params = $this->getRequest()->getParams();

			$param_array = array();
			
			/*$param_array[1] =  $params['userid'];
			$param_array[2] = $params['routeid'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_syncicsdata_customeritemmapping(?,?)',$param_array,'');*/
			$param_array[1] =  $params['userid'];
			$param_array[2] =  $params['deviceid'];
			$param_array[3] = $params['routeid'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_syncicsdata_customeritemgrp(?,?,?)',$param_array,'');
			//echo "<pre>";print_r($resultdata);
			$result['customeritemgrp']=  $resultdata[0];
			$result['customeritemmap']=  $resultdata[1];
			
            echo json_encode($result); 
   
	}
	
	public function getcustomeroutstandingAction()
	{
		$result = array();
	
			
			$reqval= $this->getRequest()->getParams();
			$this->view->params = $params = $this->getRequest()->getParams();

			$param_array = array();
			
			/*$param_array[1] =  $params['userid'];
			$param_array[2] = $params['routeid'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_syncicsdata_customeritemmapping(?,?)',$param_array,'');*/
			$param_array[1] =  $params['userid'];			
			$param_array[2] = $params['routeid'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_syncicsdata_customeroutstanding(?,?)',$param_array,'');
			//echo "<pre>";print_r($resultdata);
			$result['customeroutstanding']=  $resultdata[0];			
			
            echo json_encode($result); 
   
	}
	public function getvisualdataAction()
	{
		$result = array();
	
			
			$reqval= $this->getRequest()->getParams();
			$this->view->params = $params = $this->getRequest()->getParams();

			$param_array = array();
			
			$param_array[1] =  $params['userid'];
			$param_array[2] = $params['routeid'];
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_syncicsdata_visualdata(?,?)',$param_array,'');
			
			$result['visualheader']=  $resultdata[0];
			$result['visualdetail']=  $resultdata[1];
			
            echo json_encode($result); 
   
	}
    function stripslashes_deep($value)
    {
	if(is_array($value))
	{
	    echo "array";
	}else
	{
	    echo "not array";
	}
    $value = is_array($value) ?array_map('stripslashes_deep', $value) : stripslashes($value);

    return $value;
    }
}