<?php

class Api_ExportController extends Api_Library_Controller_Action_Abstract
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
    }

  	public function getinvoiceheaderAction()
	{
		$result = array();
	//echo "here"; //exit;
			
		
			
			$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_export_getinvoiceheader()','','');
			//print_r($resultdata); exit;
			$result['invoiceheader']=  $resultdata[0];
           //echo json_encode($result); 
		    header('Content-type: text/xml');
			echo '<invoiceheader>';
			foreach ($resultdata[0] as $row){
				$name = "";
				echo '<invoiceid>';
				foreach ($row as $val =>$key){
					echo '<'.$val.'>'.$key.'</'.$val.'>';
				} 
				echo '</invoiceid>';
			}
			echo '</invoiceheader>';
   
	}
	
	 	public function getsalesorderdetailAction()
	{
		$result = array();
			
			$resultdata = $this->SFA_Comman->executequery('CALL ws_sp_exportsalesorderdetail()','','');
			 
			//$result['salesorderdetail']=  $resultdata[0];
			
			$result['salesorderheader'] 	= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
			$result['salesorderdetail'] 	= (count($resultdata[1]) > 0) ? $resultdata[1]:array();
			 header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
		//echo "<pre>";print_r($resultdata);
        echo json_encode($result);
         
			
   
	}
	public function getardetailAction()
	{
		$result = array();
	 	$resultdata = $this->SFA_Comman->executequery('CALL ws_sp_exportarheader()','','');
		 
			//$result['salesorderdetail']=  $resultdata[0];
			
			$result['ardetail'] 	= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
			 
			 header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
        echo json_encode($result);
	}
	public function getcreditnoteAction()
	{
		$result = array();
	 	$resultdata = $this->SFA_Comman->executequery('CALL ws_sp_creditnote()','','');
		 
			//$result['salesorderdetail']=  $resultdata[0];
			
			$result['ardetail'] 	= (count($resultdata[0]) > 0) ? $resultdata[0]:array();
			 
			 header("Access-Control-Allow-Origin: *");
        //json output
	    array_walk_recursive($result,'replacenul');
        echo json_encode($result);
	}
	public function updatearheaderAction()
	{
			$entityBody = file_get_contents('php://input');
			$param =$entityBody ;
			$this->SFA_Comman->executequery('CALL ws_sp_updatearheader(?)',$param,'');
			return true;			
	}
	public function updatesalesorderdetailAction()
	{
			$entityBody = file_get_contents('php://input');
			$param =$entityBody ;
			$this->SFA_Comman->executequery('CALL ws_sp_updatesalesorderheader(?)',$param,'');
			return true;			
	}
}