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
class Reports_SalesmanroutesummaryController extends Reports_Library_Controller_Action_Abstract
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
		
		$this->report_session	= new Zend_Session_Namespace('Re_routereview');
    }

    public function routesummaryAction()
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
       
        $this->view->ReportTitle = "DSR Summary";
        $this->view->pageHeaderTitle  = $this->translate->_('Date');
        $this->view->pageHeadervalue  =  date("m/d/Y h:i:s");
     
        $this->report_session->routecode_str = "";
        if($formdata['ddlfilterby'] != "") {
            if(isset($formdata['chkall']) && $formdata['chkall'] == "on") {
                $this->report_session->routecode_str = "";
            } else {
                $all_search = $formdata["chk"];
                for($i=0;$i< count($all_search);$i++)
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
                    
                    for($i=0;$i< count($result_arr[0]);$i++)
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
                                            array("title"=> $this->filter_arr[$formdata['ddlfilterby']],
                                                  "value" => $title_val),
                                            array("title"=> "Start Date",
                                                  "value" => ($formdata['txt_route_start_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_start_date'])) : ""),
                                            array("title"=> "End Date",
                                                  "value" => ($formdata['txt_route_end_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_end_date'])) : "")
                                        );
        $this->report_session->searchParams = $this->view->searchParams;
     //    print_r($this->view->searchParams);
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/salesmanroutesummary/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/salesmanroutesummary/exportcsv";
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
    public function salesmanroutesummaryAction()
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
            $extra_where .= ' AND routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND routeenddate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] == "")
        {
            $extra_where  .= ' AND routeenddate >= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] == "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND routeenddate <= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "sed.routecode"; }
        if(empty($sord)) {  $sord  = "asc"; }
		 $startdate = date("Y-m-01", strtotime($this->report_session->post['txt_route_end_date']));
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
		$param_array[4] = $startdate;
        $param_array[5] = date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date']));
        $param_array[6] = $limit;
        $param_array[7] = $page;
      //  print_r($param_array);
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_salesman_route_summary(?,?,?,?,?,?,?)',$param_array,'');
       // print_r($result_arr);//exit;
        $count  = $result_arr[0][0]['counter'];
        // $count  = !empty($result_arr[0]) ? count($result_arr[0]) : 0;
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
        $total_targettovisit = $total_targetvisits = $total_callexceptions = $total_nontargetvisits = $total_totalvisits = $total_schedulesale = $total_schedulenosale = $total_unschedsale = $total_unschedulenosale = $total_effectivevisit = $total_collection = $total_lastcustomerbilled = $total_customerbilled = $total_invbilled = $total_itembilled = $total_avginv = $total_mtdtarget =0;
        if(!empty($result_arr[1])){
            foreach($result_arr[1] as $row) {
                $total_targettovisit += $row['targettovisit'];
                $total_targetvisits += $row['targetvisits'];
                $total_callexceptions += $row['productivecalls'];
               // $total_nontargetvisits += $row['target'];
                $total_totalvisits += $row['todayssale'];
                $total_schedulesale += $row['MTDsales'];
                $total_schedulenosale += $row['salestarget'];
                $total_unschedsale += $row['returnamt'];
                $total_unschedulenosale += $row['returntarget'];
                $total_effectivevisit += $row['foc'];
                $total_collection += $row['collection'];
                $total_lastcustomerbilled += $row['lastcustomerbilled'];
                $total_customerbilled += $row['customerbilled'];
				$total_invbilled += $row['invbilled'];
                $total_itembilled += $row['itembilled'];
                $total_avginv += $row['avginv'];
				$total_mtdtarget += $row['mtdtarget'];
				$regionmstname 		= ($this->css == 'ar_') ? $row['arbregionmstname'] 	: $row['regionmstname'];
				$areaname 		= ($this->css == 'ar_') ? $row['arbareaname'] 	: $row['areaname'];
				$salesman 		= ($this->css == 'ar_') ? $row['arbsalesman'] 	: $row['salesman'];
                
                $responce->rows[$i]['id']=$i;
                $responce->rows[$i]['cell']=array($regionmstname,$areaname,$salesman ,$row['targettovisit'],$row['targetvisits'],$row['productivecalls'],($row['mtdtarget'] <> "" ? $row['mtdtarget']:'0.000'), ($row['todayssale'] <> "" ? $row['todayssale']:'0.000'),($row['MTDsales'] <> "" ? $row['MTDsales']:'0.000'),$row['salestarget'],($row['returnamt'] <> "" ? $row['returnamt']:'0.000'),($row['returntarget'] <> "" ? $row['returntarget']:'0.000'),($row['foc'] <> "" ? $row['foc']:'0.000'),$row['lastcustomerbilled'],$row['customerbilled'],$row['invbilled'],$row['itembilled'],($row['avginv'] <> "" ? $row['avginv']:'0.000'),($row['mtdtarget'] <> "" ? '0.000':'0.000'),($row['collection'] <> "" ?$row['collection']:'0.000'));
                $i++;
              
            }
        }
        else
        {
            //  $responce->rows[$i]['id']=1;
            //  $responce->rows[$i]['cell']=array("","","","No Record Founds","", "");
        }
        $responce->userdata['salesman'] = $this->translate->_('Total');
        $responce->userdata['targettovisit'] = $total_targettovisit;
        $responce->userdata['targetvisits'] = $total_targetvisits;
        $responce->userdata['callexceptions'] = $total_callexceptions;
        $responce->userdata['nontargetvisits'] = $total_nontargetvisits;
        $responce->userdata['totalvisits'] = $total_totalvisits;
        $responce->userdata['schedulesale'] = $total_schedulesale;
        $responce->userdata['schedulenosale'] = $total_schedulenosale;
        $responce->userdata['unschedsale'] = $total_unschedsale;
        $responce->userdata['unschedulenosale'] = $total_unschedulenosale;
        $responce->userdata['effectivevisit'] = $total_effectivevisit;
        $responce->userdata['collection'] = $total_collection;
        $responce->userdata['lastcustomerbilled'] = $total_lastcustomerbilled;
        $responce->userdata['customerbilled'] = $total_customerbilled;
        $responce->userdata['invbilled'] = $total_invbilled;
        $responce->userdata['itembilled'] = $total_itembilled;
        $responce->userdata['avginv'] = $total_avginv;
        $responce->userdata['mtdtarget'] = 0;//$total_mtdtarget;
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
            $extra_where .= ' AND routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND routeenddate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] == "")
        {
            $extra_where  .= ' AND routeenddate >= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] == "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND routeenddate <= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "rgm.regionmstcode";}
        if(empty($sord)) {  $sord  = "asc";}
		$startdate = date("Y-m-01", strtotime($this->report_session->post['txt_route_end_date']));
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = "sed.routecode,".$sidx;
        $param_array[3] = $sord;
		$param_array[4] = $startdate;
        $param_array[5] = date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date']));
        $param_array[6] = $limit;
        $param_array[7] = $page;
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_salesman_route_summary(?,?,?,?,?)',$param_array,'');
     //   print_r( $result_arr);
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
        
        $column_model_arr = array();
        $data_arr["columns"] = array($this->translate->_('Region'),$this->translate->_('Area'),$this->translate->_('Salesman'),$this->translate->_('Planned Visit'),$this->translate->_('Actual Visit'),$this->translate->_('Productive Calls'),$this->translate->_('Monthly Target'),$this->translate->_('Todays Sales'),$this->translate->_('MTD Sales'),$this->translate->_('Sales Vs Target%'),$this->translate->_('Return'),$this->translate->_('Return Vs Sales%'),$this->translate->_('FOC Qty'),$this->translate->_('No of Customer Billed in last 3 months'),$this->translate->_('No Of Customer Billed'),$this->translate->_('No of invoice Billed'),$this->translate->_('No of SKU Billed'),$this->translate->_('Avg Inv Value'),$this->translate->_('Monthly Collection Target'),$this->translate->_('Collection'));
        $data_arr["columns_config"] =   array(
                                            array("width"=>12),
                                            array("width"=>15),
                                            array("width"=>13,"toaltext"=>$this->translate->_('Total'),"group_total_text"=>$this->translate->_('Group Total')),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                        );
        for($i = 0; $i < count($result_arr[0]); $i++)
        {
			$regionmstname 		= ($this->css == 'ar_') ? $result_arr[0][$i]['arbregionmstname'] 	: $result_arr[0][$i]['regionmstname'];
			$areaname 		= ($this->css == 'ar_') ? $result_arr[0][$i]['arbareaname'] 	: $result_arr[0][$i]['areaname'];
			
            $column_model_arr[$regionmstname][] = array($areaname,$result_arr[0][$i]['salesman'],$result_arr[0][$i]['targettovisit'],$result_arr[0][$i]['targetvisits'],$result_arr[0][$i]['productivecalls'],$result_arr[0][$i]['target'],$result_arr[0][$i]['todayssale'],$result_arr[0][$i]['MTDsales'],$result_arr[0][$i]['salestarget'],$result_arr[0][$i]['returnamt'],$result_arr[0][$i]['returntarget'],$result_arr[0][$i]['foc'],$result_arr[0][$i]['lastcustomerbilled'],$result_arr[0][$i]['customerbilled'],$result_arr[0][$i]['invbilled'],$result_arr[0][$i]['itembilled'],$result_arr[0][$i]['avginv'],($result_arr[0][$i]['mtdtarget']<> ""?'0.000':'0.000'),$result_arr[0][$i]['collection']);
        }
        //pr($column_model_arr,1);
        $data_arr["columns_model"]          		= $column_model_arr;
        $data_arr["config"]["report_title"] 		= $this->translate->_('DSR Summary').$report_title;
        $data_arr["config"]["report_title_height"] 	= $report_title_height;
        $data_arr["config"]["file_name"]    		= "DSR Summary";
        $data_arr["config"]["group_level"]  		= 1;
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