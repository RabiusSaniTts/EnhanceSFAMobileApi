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
class Reports_SalesmanrouteformatController extends Reports_Library_Controller_Action_Abstract
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

    public function routeformatAction()
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
        //print_r( $formdata);exit;
        $this->report_session->post = $formdata;
       
        $this->view->ReportTitle = "DSR Format Detail";
        $this->view->pageHeaderTitle  = $this->translate->_('Date');
        $this->view->pageHeadervalue  =  date("m/d/Y h:i:s");
     
        $this->report_session->routecode_str = "";
        if($formdata['ddlfilterby'] != "") {
			   
            if(isset($formdata['chkall']) && $formdata['chkall'] == "on" && 1==0) {  
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
		//print_r($routecode_str);exit;
        //echo "1--2--66";exit;
        $this->view->searchParams  =    array(
                                            array("title"=> $this->filter_arr[$formdata['ddlfilterby']],
                                                  "value" => $title_val),
                                            array("title"=> "Start Date",
                                                  "value" => ($formdata['txt_route_start_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_start_date'])) : ""),
                                            array("title"=> "End Date",
                                                  "value" => ($formdata['txt_route_end_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_end_date'])) : "")
                                        );
        $this->report_session->searchParams = $this->view->searchParams;
       //print_r($this->view->searchParams);
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/salesmanrouteformat/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/salesmanrouteformat/exportcsv";
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
    public function salesmanrouteformatAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
     //   echo "here"; exit; sed.
        //if($this->report_session->post['ddlroute'] != "" )
        //{
        //    $extra_where  = " and rm.routecode = ".$this->report_session->post['ddlroute'];
        //}
        if(isset($this->report_session->routecode_str) && $this->report_session->routecode_str != "")
        {
            $extra_where .= ' AND rm.routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND sed1.routeenddate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] == "")
        {
            $extra_where  .= ' AND sed1.routeenddate >= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] == "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND sed1.routeenddate <= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "sed1.routecode,sed1.routeenddate";}
        if(empty($sord)) {  $sord  = "asc";}
    
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx.",sed1.routeenddate";
        $param_array[3] = $sord;
		$param_array[4] = date("Y-m-d", strtotime($this->report_session->post['txt_route_start_date']));
        $param_array[5] = date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date']));
		$param_array[6] = date("Y-m-01", strtotime($this->report_session->post['txt_route_end_date']));
        $param_array[7] = $limit;
        $param_array[8] = $page;
//$param_array[8] = $this->report_session->routecode_str;
         
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_salesman_route_format(?,?,?,?,?)',$param_array,'');
        
        $count  = count($result_arr[0]);//$result_arr[0][0]['counter'];
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
        $total_targettovisit = $total_targetvisits = $total_callexceptions = $total_nontargetvisits = $total_totalvisits = $total_schedulesale = $total_schedulenosale = $total_unschedsale = $total_unschedulenosale = $total_effectivevisit = $total_startkms = $total_endkms = $total_kmscovered =0;
        if(!empty($result_arr[0])){
            foreach($result_arr[0] as $row) {
                $total_targettovisit += $row['targettovisit'];
                $total_targetvisits += $row['targetvisits'];
                $total_productivecalls += $row['productivecalls'];
               // $total_target += $row['target'];
                $total_todayssale += $row['todayssale'];
				 $total_todaysinvoice += $row['todaysinvoice'];
				 
                $total_MTDsales += $row['MTDsales'];
				$total_MTDinvoice += $row['MTDinvoice'];
				$sum_mtd_sales_inv=$row['MTDsales']+$row['MTDinvoice'];
                $total_salestarget += $row['salestarget'];
                $total_returnamt += $row['returnamt'];
                $total_returntarget += $row['returntarget'];
                $total_foc += $row['foc'];
                $total_collection += $row['collection'];
                $total_endkms += $row['endkms'];
                $total_kmscovered += $row['kmscovered'];
				
				$routename 		= ($this->css == 'ar_') ? $row['arbroutename'] 	: $row['route'];
                
                $responce->rows[$i]['id']=$i;
                $responce->rows[$i]['cell']=array($routename,$row['routestartdate1'],$row['daytxt'],$row['routeenddate1'],$row['targettovisit'],$row['targetvisits'],$row['productivecalls'],$row['target'],$row['todayssale'],$row['todaysinvoice'],$row["MTDsales"],$row['salestarget'],$row['returnamt'],$row['returntarget'],$row['foc'],$row['collection'],$row["startkms"],$row['endkms'],$row['kmscovered']);
                $i++;
              
            }
        }
        else
        {
            //  $responce->rows[$i]['id']=1;
            //  $responce->rows[$i]['cell']=array("","","","No Record Founds","", "");
        }
        $responce->userdata['routeenddate'] = $this->translate->_('Total');
        $responce->userdata['targettovisit'] = $total_targettovisit;
        $responce->userdata['targetvisits'] = $total_targetvisits;
        $responce->userdata['productivecalls'] = $total_productivecalls;
       // $responce->userdata['target'] = $total_target;
        $responce->userdata['todayssale'] = $total_todayssale;
		$responce->userdata['todaysinvoice'] = $total_todaysinvoice;
		
        $responce->userdata['MTDsales'] = $total_MTDsales;//+$total_MTDinvoice;
        $responce->userdata['salestarget'] = $total_salestarget;
        $responce->userdata['returnamt'] = $total_returnamt;
        $responce->userdata['returntarget'] = $total_returntarget;
        $responce->userdata['foc'] = $total_foc;
        $responce->userdata['collection'] = $total_collection;
		//$responce->userdata['endkms'] = $total_endkms;
        $responce->userdata['kmscovered'] = $total_kmscovered;
        
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
            $extra_where .= ' AND rm.routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND sed1.routeenddate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] == "")
        {
            $extra_where  .= ' AND sed1.routeenddate >= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] == "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND sed1.routeenddate <= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "sed1.routecode";}
        if(empty($sord)) {  $sord  = "asc";}
    
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx.",sed1.routeenddate";
        $param_array[3] = $sord;
		$param_array[4] = date("Y-m-d", strtotime($this->report_session->post['txt_route_start_date']));
        $param_array[5] = date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date']));
		$param_array[6] = date("Y-m-01", strtotime($this->report_session->post['txt_route_end_date']));
        $param_array[7] = $limit;
        $param_array[8] = $page;
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_salesman_route_format(?,?,?,?,?)',$param_array,'');
         //print_r($result_arr);exit;
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
        $data_arr["columns"] = array($this->translate->_('Route'),$this->translate->_('Route Start Date'),$this->translate->_('Day'),$this->translate->_('Route End Date'),$this->translate->_('Planned Visit'),$this->translate->_('Actual Visit'),$this->translate->_('Productive Calls'),$this->translate->_('Target'),$this->translate->_('Todays Sales Order'),$this->translate->_('Todays Invoice'),$this->translate->_('MTD Sales'),$this->translate->_('Sales Vs Target%'),$this->translate->_('Return'),$this->translate->_('Return Vs Sales%'),$this->translate->_('FOC Qty'),$this->translate->_('Collection'),$this->translate->_('Starting Kms'),$this->translate->_('Ending Kms'),$this->translate->_('Total Kms Covered'));
        $data_arr["columns_config"] =   array(
                                            array("width"=>12),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>15,"toaltext"=>$this->translate->_('Total'),"group_total_text"=>$this->translate->_('Group Total')),
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
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
											array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1")
                                        );
        for($i = 0; $i < count($result_arr[0]); $i++)
        {
			$routename 		= ($this->css == 'ar_') ? $result_arr[0][$i]['arbroutename'] 	: $result_arr[0][$i]['route'];
			
            $column_model_arr[$routename][] = array($result_arr[0][$i]['routestartdate1'],$result_arr[0][$i]['daytxt'],$result_arr[0][$i]['routeenddate1'],$result_arr[0][$i]['targettovisit'],$result_arr[0][$i]['targetvisits'],$result_arr[0][$i]['productivecalls'],$result_arr[0][$i]['target'],$result_arr[0][$i]['todayssale'],$result_arr[0][$i]['todaysinvoice'],$result_arr[0][$i]['MTDsales'],$result_arr[0][$i]['salestarget'],$result_arr[0][$i]['returnamt'],$result_arr[0][$i]['returntarget'],$result_arr[0][$i]['foc'],$result_arr[0][$i]['collection'],$result_arr[0][$i]['startkms'], $result_arr[0][$i]['endkms'],$result_arr[0][$i]['kmscovered']);
        }
        //pr($column_model_arr,1);
		
        $data_arr["columns_model"]          		= $column_model_arr;
        $data_arr["config"]["report_title"] 		= $this->translate->_('DSR Format Detail').$report_title;
        $data_arr["config"]["report_title_height"] 	= $report_title_height;
        $data_arr["config"]["file_name"]    		= "DSR Format Detail";
        $data_arr["config"]["group_level"]  		= 1;
        $data_arr["config"]["total_columns"]		= count($data_arr["columns"]);
        $data_arr["config"]["group_total"]  		= "1";
        $data_arr["config"]["main_total"]   		= "1";
        
        //echo "<pre>";print_r($data_arr);
		
		//exit;
        $SFA_Exportxls = new SFA_Exportxls($data_arr);
        $objPHPExcel = $SFA_Exportxls->exportxls();
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
        exit;
    }
}