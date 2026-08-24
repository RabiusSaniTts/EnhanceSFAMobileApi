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
class Reports_RoutestrikerateandproductivitymonthwiseController extends Reports_Library_Controller_Action_Abstract
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
		
		$this->report_session	= new Zend_Session_Namespace('Re_routestrikerate');
    }

    public function routestrikerateandproductivitymonthwiseAction()
    {  
        $this->view->params 	= $params = $this->getRequest()->getParams();
        $this->view->formdata  = $formdata = $this->_request->getPost();
        
        //$result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_route_review_detail()','','');
        //$this->view->route_list = $result_arr[0];
        $this->view->itemgrid    = $this->view->BaseUrl("/".$params['module']."/ajaxdata/useraccessgrid");
        
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
       
        $this->view->ReportTitle = "Month Wise Route Strike Rate And Productivity";
        $this->view->pageHeaderTitle  = $this->translate->_('Date');
        $this->view->pageHeadervalue  =  date("m/d/Y h:i:s");
     //print_r($formdata);exit;
        $this->report_session->routecode_str = "";
		if($formdata['ddlfilterby']=="")
		{
		$formdata['ddlfilterby']=0;	
		}
		
		
		$datefield=explode("-",$formdata['txt_route_end_date']);
					
                    $param_array = array();
                    $param_array[1] = $formdata['ddlfilterby'];
                   // $param_array[2] = implode(",",$chk_arr); 
					$param_array[2] = $datefield[0];
					$param_array[3] = $datefield[1];
                    //print_r($param_array);exit;
                    $result_arr = $this->SFA_Comman->executequery('CALL SP_Productivity_Strike_Rate_New(?,?,?)',$param_array,'');
                    //print_r($result_arr);exit;
					
					
				
        
        $this->view->searchParams  =    array(
                                            array("title"=> $formdata['ddlfilterby'],
                                                  "value" => $formdata['ddlfilterby']),
                                            array("title"=> "Month",
                                                  "value" => $formdata['txt_route_start_date'] ) 
                                        );
        $this->report_session->searchParams = $this->view->searchParams;
         //print_r($this->view->searchParams);
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/routestrikerateandproductivitymonthwise/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/routestrikerateandproductivitymonthwise/exportcsv";
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
    public function routestrikerateandproductivitydataAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";

         
       // print_r($formdata);exit;
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        //print_r($param_array);exit;
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_route_strikerate_and_productivity(?,?,?,?,?)',$param_array,'');
        
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
                
                $responce->rows[$i]['id']=$i;
               $responce->rows[$i]['cell']=array($row['divisioncode'],$row['salesmancode'],$row['salesmanname1'],$row['arbsalesmanname1'],$row['Mtd_odometer'],$row['plannedcalls'],$row['actualcalls'],$row['unschedulecall'],$row['cashsale'],$row['creditsale'],$row['productivecalls'],$row['totalreceipt'],$row['strikerate'],$row['productiverate'],$row['CustomerFaceTime'],$row['OTPUsedCount'],$row['settlementskipeddays']);
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
        
        //if($this->report_session->post['ddlroute'] != "" )
        //{
        //    $extra_where  = " and rm.routecode = ".$this->report_session->post['ddlroute'];
        //}
        if(isset($this->report_session->routecode_str) && $this->report_session->routecode_str != "")
        {
            $extra_where .= ' AND sed.routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND sed.routeenddate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
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
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_route_strikerate_and_productivity(?,?,?,?,?)',$param_array,'');
        
        $report_title_height = 15;
        for($i=0;$i<count($this->report_session->searchParams);$i++)
        {
            if($this->report_session->searchParams[$i]["value"] != "")
            {
                $report_title .= "\r ".$this->report_session->searchParams[$i]["title"] . " : ".$this->report_session->searchParams[$i]["value"];
                $report_title_height += 10;
            }
        }
        
        $data = $result_arr[1];
        $data_arr = array();
		
        
        $column_model_arr = array();
        $data_arr["columns"] = array($this->translate->_('Route Code'),$this->translate->_('Route Name'),$this->translate->_('Salesman Name'),$this->translate->_('Planned Calls'),$this->translate->_('Actual calls'),$this->translate->_('Total Cash Sale'),$this->translate->_('Total Credit Sale'),$this->translate->_('Total Receipts'),$this->translate->_('Productive Calls'),$this->translate->_('StrikeRate %'),$this->translate->_('Productivity %'));
        $data_arr["columns_config"] =   array(
                                            array("width"=>12),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>15),
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
				$routename 		= ($this->css == 'ar_') ? $data[$i]['arbroutename'] 	: $data[$i]['routename'];
				$salesmanname	= ($this->css == 'ar_') ? $data[$i]['arbsalesmanname1'] 	: $data[$i]['salesmanname1'];
			
            $column_model_arr[] = array($data[$i]['routecode'],$routename,$salesmanname,$data[$i]['plannedcalls'],$data[$i]['actualcalls'],$data[$i]['cashsale'], $data[$i]['creditsale'],$data[$i]['totalreceipt'],$data[$i]['productivecalls'],$data[$i]['strikerate'],$data[$i]['productiverate']);
        }
		//print_r($column_model_arr);
        //pr($column_model_arr,1);
        $data_arr["columns_model"]          		= $column_model_arr;
        $data_arr["config"]["report_title"] 		= $this->translate->_('Route Strike Rate And Productivity').$report_title;
        $data_arr["config"]["report_title_height"] 	= $report_title_height;
        $data_arr["config"]["file_name"]    		= "Route Strike Rate And Productivity";
        $data_arr["config"]["group_level"]  		= 0;
        $data_arr["config"]["total_columns"]		= count($data_arr["columns"]);
        $data_arr["config"]["group_total"]  		= "1";
        $data_arr["config"]["main_total"]   		= "1";
        
        
        $SFA_Exportxls = new SFA_Exportxls($data_arr);
        $objPHPExcel = $SFA_Exportxls->exportxls();
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
        exit;
    }
}