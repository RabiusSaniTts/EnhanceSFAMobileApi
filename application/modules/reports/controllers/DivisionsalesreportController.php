<?php
/**
* @name       AccountController
* @since      20-02-2012
* @version    Release: 1
* @author     PM <pankit@elantechnologies.com>
* @copyright  Elan Technologies
* @param
*
* This controller is manage report module.
*/
class Reports_DivisionsalesreportController extends Reports_Library_Controller_Action_Abstract
{
     /**
    * @name       init
    * @since      01-10-2012
    * @version    Release: 6
    * @author     Nidhi
    * @copyright  Elan Technologies
    * @param
    *
    * This is the default function for all Actions.
    *
    */
    protected $report_session ;
    public function init()
    {
		$this->translate 	= Zend_Registry::get('Zend_Translate');
		$this->SFA_Comman	= new SFA_Comman();
		$this->view->colan	= $this->translate->_('Colan');
		$this->css 			= $this->translate->_('CSS');
		$this->view->css	= $this->css;
		
		$this->currentUser = SFA_Loginauth::getIdentity();	
		if(!isset($this->currentUser) || empty($this->currentUser))
		{
			SFA_Message::setMsg($this->translate->_('Do Login'));
			$this->_helper->redirector("index", "index", "home");
			$url = $this->view->baseUrl();
			echo '<script type="text/javascript">window.location="'.$url.'";</script>';
			exit;
		}
		
		$this->sec_lang			= $this->view->sec_lang;
		$this->decimalplaces  	= $this->view->decimalplaces	= $this->SFA_Comman->getdecimalplaces();
		$this->view->sec_lang	= $this->SFA_Comman->getsecondlanguage();
		
		$this->report_session	= new Zend_Session_Namespace('Re_customervisit');
    }

    public function divisionsalesAction()
    {
        $this->view->params 	= $params 	= $this->getRequest()->getParams();
        $this->view->formdata   = $formdata = $this->_request->getPost();
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_combo_divisionmaster()','','');
        $this->view->division_list = $result_arr[0];
        $this->view->itemgrid   = $this->view->BaseUrl("/".$params['module']."/ajaxdata/useraccessgrid");
        
        $this->report_session->post = array();
   }

    /**
    * @name       totalsalesbyhierarchyAction
    * @since      15-02-2012
    * @version    Release: 1
    * @author     PM <pankit@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This action is for display daily sales sheet report
    *
    */
    public function indexAction()
    {
        $this->_helper->layout->setLayout('jqreport');
        $this->view->params 	= $params = $this->getRequest()->getParams();
        $this->view->formdata  = $formdata = $this->_request->getPost();
        
        $this->report_session->post = $formdata;
       
        $this->view->ReportTitle = "division Sales Report";
        $this->view->pageHeaderTitle  = $this->translate->_('Date');
        $this->view->pageHeadervalue  =  date("m/d/Y h:i:s");
     
        $this->report_session->routecode_str = "";
        if($formdata['ddlfilterby'] != "") {
            if(isset($formdata['chkall']) && $formdata['chkall'] == "on") {
                $this->report_session->routecode_str = "";
            } else {
                $all_search = $formdata["chk"];
                for($i=0;$i<count($all_search);$i++)
                {
                    $search_arr = explode("$$",$all_search[$i]);
                    $chk_arr[] = $search_arr[0];
                    $name_arr[] = $search_arr[1];
                }
                
                $routecode_str = "";
                if($formdata['ddlfilterby'] != 6) {
                    $param_array = array();
                    $param_array[1] = $formdata['ddlfilterby'];
                    $param_array[2] = implode(",",$chk_arr);
                    
                    $result_arr = $this->SFA_Comman->executequery('CALL sp_report_common_get_report(?,?)',$param_array,'');
                    
                    $routecode_arr = array();
                    
                    for($i=0;$i<count($result_arr[0]);$i++)
                    {
                        $routecode_arr[] = $result_arr[0][$i]["routecode"];
                    }
                    if(!empty($routecode_arr)) {
                        $routecode_str = implode(",",$routecode_arr);
                    }
                } else {
                    $routecode_str = implode(",",$chk_arr);
                }
                
                $this->report_session->routecode_str = $routecode_str;
            }
        }
        if($formdata['chkall'] == "on") {
            $title_val = "All ".$this->filter_arr[$formdata['ddlfilterby']];
        } elseif(isset($name_arr) && !empty($name_arr)) {
            $title_val = implode(", ",$name_arr);
        } else {
            $title_val = "";
        }
        
        $this->view->searchParams  =    array(
                                            array("title"=> "Division",
                                                  "value" => $formdata['ddldivision']),
                                            array("title"=> "Start Date",
                                                  "value" => ($formdata['txt_route_start_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_start_date'])) : ""),
                                            array("title"=> "End Date",
                                                  "value" => ($formdata['txt_route_end_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_end_date'])) : "")
                                        );
        $this->report_session->searchParams = $this->view->searchParams;
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/divisionsalesreport/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/divisionsalesreport/exportcsv";
    }
    /**
      * @name       custpendingbalAction
      * @since      15-02-2012
      * @version    Release: 1
      * @author     GP <gayatri@elantechnologies.com>
      * @copyright  Elan Technologies
      * @param
      *
      * This action fetch customer pending request data
      *
      */
    public function salesdataAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";

        if(isset($this->report_session->post['ddldivision'] ) && $this->report_session->post['ddldivision']  != "")
        {
            $extra_where .= ' AND CM.DivisionCode =  "'.$this->report_session->post['ddldivision'].'"';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND IH.ActualTransactionDate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
       
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "sed.routecode";}
        if(empty($sord)) {  $sord  = "asc";}
    
        $param_array = array();
      /*  $param_array[1] = $extra_where;
        $param_array[2] =  $this->report_session->post['ddltype'];*/
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        $param_array[6] =  $this->report_session->post['ddltype'];
		
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_division_salesreport(?,?,?,?,?)',$param_array,'');
        
        $count  = $result_arr[0][0]['counter'];
        //$count  = !empty($result_arr[0]) ? count($result_arr[0]) : 0;
        if( $count >0 ) {
            $total_pages = ceil($count/$limit);
        } else {
            $total_pages = 0;
        }
        if ($page > $total_pages) $page=$total_pages;
        $start = $limit*$page - $limit; // do not put $limit*($page - 1)
    
        $responce->page = $page;
        $responce->total = $total_pages;
        $responce->records = $count;
        $i=0;
     
        if(!empty($result_arr[1])){
            foreach($result_arr[1] as $row) {
       
				$routename 		= ($this->css == 'ar_') ? $row['arbroutename'] 	: $row['routename'];
				$salesmanname	= ($this->css == 'ar_') ? $row['arbsalesmanname1'] 	: $row['salesmanname1'];
				$customername 		= ($this->css == 'ar_') ? $row['arbcustomername'] 	: $row['customername'];
				$itemshortdescription 	= ($this->css == 'ar_') ? $row['arbitemshortdescription'] 	: $row['itemshortdescription'];
                
                $responce->rows[$i]['id']=$i;
                $responce->rows[$i]['cell']=array($row['RouteCode'],$row['RouteName'],$row['SalesmanCode'],$row['SalesmanName'],$row['CustomerCode'],$row['Customer'],$row['Channel'],$row['InvoiceNumber'],$row['InvoiceDate'],$row['InvoiceType'],$row['ItemCode'],$row['ItemDescription'],$row['SalesQuantity'],$row['FreeQuantity'],$row['NetQuantity'],$row['GroupingCode'],$row['OutletQuality']);
                $i++;
              
            }
        }
        else
        {
            //  $responce->rows[$i]['id']=1;
            //  $responce->rows[$i]['cell']=array("","","","No Record Founds","", "");
        }
   
        
        echo json_encode($responce);
        exit;
    }
      
      
    /**
    * @name       exportAction
    * @since      15-02-2012
    * @version    Release: 1
    * @author     HC <harsh@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This export the pdf in HTML format
    *
    */
    public function exportAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
        
      if(isset($this->report_session->post['ddldivision'] ) && $this->report_session->post['ddldivision']  != "")
        {
            $extra_where .= ' AND CM.DivisionCode =  "'.$this->report_session->post['ddldivision'].'"';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND IH.ActualTransactionDate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "sed.routecode";}
        if(empty($sord)) {  $sord  = "asc";}
    
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        $param_array[6] =  $this->report_session->post['ddltype'];
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_division_salesreport(?,?,?,?,?)',$param_array,'');
		// print_r($result_arr);exit;
        $result=$result_arr[0] ;
		$filename = "DivisionSalesReport";
		$file_ending = "xls";
		
		
		

//header info for browser
 
header("Content-Type: application/xls");    
header("Content-Disposition: attachment; filename=$filename.xls");  
header("Pragma: no-cache"); 
header("Expires: 0"); 
/*******Start of Formatting for Excel*******/   
//define separator (defines columns in excel & tabs in word)
$sep = "\t"; //tabbed character
//start of printing column names as names of MySQL fields
//echo count($result);exit;
		//for ($i = 0; $i < mysql_num_fields($result); $i++) {
//echo mysql_field_name($result,$i) . "\t";
//}
foreach ($result[0] as $key => $value) {
 echo $key. "\t"; 
}
print("\n");  //echo "exit";exit;  
//end of printing column names  
//start while loop to get data
      $sep = "\t";
        $schema_insert = "";
        for($j=0; $j<count($result);$j++)
        {
			if($j>1)
				$schema_insert .= "\n";
			$indexedval=array_values($result[$j]);
					for($k=0; $k<count($indexedval);$k++)
				{
				
					 
						 echo $indexedval[$k].$sep;//exit;
						 if($k==count($indexedval)-1)
							 print "\n";
					// $schema_insert .= "$indexedval[$k]".$sep;
				}
				 
				
				if($j==count($result)-1)
				{
					//$schema_insert = str_replace($sep."$", "", $schema_insert);
					//$schema_insert = preg_replace("/\r\n|\n\r|\n|\r/", " ", $schema_insert);
					//$schema_insert .= "\t";
					//print(trim($schema_insert));
					print "\n";
				}
        }
        
     
		
	exit;	
		
        $report_title_height = 15;
        for($i=0;$i<count($this->report_session->searchParams);$i++)
        {
            if($this->report_session->searchParams[$i]["value"] != "")
            {
                $report_title .= "\r ".$this->report_session->searchParams[$i]["title"] . " : ".$this->report_session->searchParams[$i]["value"];
                $report_title_height += 10;
            }
        }
        
        $data = $result_arr[0];
        $data_arr = array();
    //    print_r($result_arr[0]);
        $column_model_arr = array();
        $data_arr["columns"] = array($this->translate->_('Route Code'),$this->translate->_('Route Name'),$this->translate->_('Salesman Code'),$this->translate->_('Salesman Name'),$this->translate->_('Customer Code'),$this->translate->_('Customer'),$this->translate->_('Channel'),$this->translate->_('Invoice Number'),$this->translate->_('Invoice Date'),$this->translate->_('Involice Type'),$this->translate->_('Item Code'),$this->translate->_('Item Description'),$this->translate->_('Sales Quantity'),$this->translate->_('Free Quantity'),$this->translate->_('Net Quantity'),$this->translate->_('Grouping Code'),$this->translate->_('Outlet quality'));
        $data_arr["columns_config"] =   array(
                                            array("width"=>12),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13)
                                        );
        for($i = 0; $i < count($data); $i++)
        {
            $column_model_arr[] = array($data[$i]['RouteCode'],$data[$i]['RouteName'],$data[$i]['SalesmanCode'],$data[$i]['SalesmanName'],$data[$i]['CustomerCode'],$data[$i]['Customer'],$data[$i]['Channel'],$data[$i]['InvoiceNumber'],$data[$i]['InvoiceDate'],$data[$i]['InvoiceType'],$data[$i]['ItemCode'],$data[$i]['ItemDescription'],$data[$i]['SalesQuantity'],$data[$i]['FreeQuantity'],$data[$i]['NetQuantity'],$data[$i]['GroupingCode'],$data[$i]['OutletQuality']);
        }
		 
		
        echo "<pr>";print_r($column_model_arr);exit;
        $data_arr["columns_model"]          		= $column_model_arr;
        $data_arr["config"]["report_title"] 		= $this->translate->_('Division Sales').$report_title;
        $data_arr["config"]["report_title_height"] 	= $report_title_height;
        $data_arr["config"]["file_name"]    		= "Division Sales";
        $data_arr["config"]["group_level"]  		= 0;
        $data_arr["config"]["total_columns"]		= count($data_arr["columns"]);
        echo "<pr>";print_r($data_arr);exit;
        
        $SFA_Exportxls = new SFA_Exportxls($data_arr);
        $objPHPExcel = $SFA_Exportxls->exportxls();
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
        exit;
    }
}