<?php
/**
* @name       RoutesummaryController
* @since      05-10-2012
* @version    Release: 1
* @author     PT <pankil@elantechnologies.com>
* @copyright  Elan Technologies
* @param
*
* This controller is manage report module.
*/
class Reports_MonthwisestrkrateController extends Reports_Library_Controller_Action_Abstract
{
     /**
    * @name       init
    * @since      05-10-2012
    * @version    Release: 1
    * @author     PT <Pankil@elantechnologies.com>
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
        $this->view->colan	= $this->translate->_('Colan');
        $this->SFA_Comman	= new SFA_Comman();
        
        $this->currentUser = SFA_Loginauth::getIdentity();	
        if(!isset($this->currentUser) || empty($this->currentUser))
        {
            SFA_Message::setMsg($this->translate->_('Do Login'));
            $this->_helper->redirector("index", "index", "home");
			$url = $this->view->baseUrl();
			echo '<script type="text/javascript">window.location="'.$url.'";</script>';
			exit;
        }
        
        $this->sec_lang 	  = $this->view->sec_lang;
        $this->decimalplaces  = $this->view->decimalplaces	= $this->SFA_Comman->getdecimalplaces();
        $this->view->sec_lang = $this->SFA_Comman->getsecondlanguage();
        
        $this->report_session = new Zend_Session_Namespace('Re_routesummary');
        $this->session = $this->view->session = new Zend_Session_Namespace('SESSION');
    }
	
	/**
    * @name       preDispatch
    * @since      26- sep-2012
    * @version    Release: 1
    * @author     PT <pankil@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This is the default function for all Actions.
    *
    */
    
    public function preDispatch()
    {
        parent::preDispatch();
        
        /**
         *      Acl Code start
         */
        $getparams_init = $this->getRequest()->getParams();
        $getpost_init = $this->_request->getPost();
        
        if(in_array($getparams_init['action'],$this->current_read_delete_arr))
        {
            if(!$this->checkaccess("read")) {
                
                $this->_forward('noaccess','aclaccess','home', array("actiontype"=>"read","modulename"=>$this->currentmodulename));
                
            }
        }
        
        /**
         *      Acl Code end
         */
    }

  /**
    * @name       routesummaryAction
    * @since      05-10-2012
    * @version    Release: 1
    * @author     PT <pankil@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This action is for display discount summary
    *
    */
    public function monthwisestrkrateAction()
    {
        $this->view->params 	= $params = $this->getRequest()->getParams();
        $this->view->formdata  = $formdata = $this->_request->getPost();
        
        //$result_arr = $this->SFA_Comman->executequery('CALL sp_report_dailyreport_routesummary_detail()','','');
		$result = $this->SFA_Comman->executequery('CALL sp_combo_division()','','');
        $this->view->com_data = $result[0];
        //$this->view->route_list = $result_arr[0];
        $this->view->itemgrid    = $this->view->BaseUrl("/".$params['module']."/ajaxdata/useraccessgrid");
        
        $this->report_session->post = array();
   }


    /**
    * @name       totalsalesbyhierarchyAction
    * @since      04-10-2012
    * @version    Release: 1
    * @author     PT <pankil@elantechnologies.com>
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
        
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/monthwisestrkrate/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/monthwisestrkrate/exportcsv";
        
        $this->report_session->routecode_str = "";
		
		$formdata['ddlfilterby2']=implode(",",$formdata['ddlfilterby2']);
		
		if($formdata['ddlfilterby2'] == "") {
					$formdata['ddlfilterby2']=0;
				} 
				//print_r($formdata);exit;
        if($formdata['ddlfilterby2'] != "") { //echo "here".$formdata['ddlfilterby'];exit;
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
				
                if($formdata['ddlfilterby2'] != 6) {
                   
                    $datefield=explode("-",$formdata['txt_route_end_date']);
					
                    $param_array = array();
                    $param_array[1] = $formdata['ddlfilterby2'];
                    $param_array[2] = implode(",",$chk_arr);
                    //print_r($param_array);exit;
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
		//echo  $routecode_str;exit;
        if($formdata['chkall'] == "on") {
			//echo "here2:".$formdata['ddlfilterby'];exit;
            $title_val = "All ".$this->filter_arr[$formdata['ddlfilterby2']];
        } elseif(isset($name_arr) && !empty($name_arr)) {
			//echo "here3:".$formdata['ddlfilterby2'];exit;
            $title_val = implode(", ",$name_arr);
        } else { //echo "here4:".$formdata['ddlfilterby2'];exit;
            $title_val = "";
        }
		//print_r($formdata);exit;
        $this->view->searchParams  =  array(
                                            array("title"=> $this->filter_arr[$formdata['ddlfilterby2']],
                                                  "value" => $title_val),
                                            array("title"=> "Month - Year",
                                                  "value" => ($formdata['txt_route_end_date'] != "" ) ? $formdata['txt_route_end_date'] : "")
                                            );
        $this->report_session->searchParams = $this->view->searchParams;
    }
    /**
      * @name       discountsummarydataAction
      * @since      05-10-2012
      * @version    Release: 1
      * @author     PT <pankil@elantechnologies.com>
      * @copyright  Elan Technologies
      * @param
      *
      * This action fetch customer pending request data
      *
      */
    public function routesummarydataAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
        
		
		//print_r($this->report_session->post);exit;
		$datefield=explode("-",$this->report_session->post['txt_route_end_date']);
		
		
		$this->report_session->post['ddlfilterby2']=implode(",",$this->report_session->post['ddlfilterby2']);
		
		   if($this->report_session->post['ddlfilterby2'] == "")
        {
			$this->report_session->post['ddlfilterby2']=0;
		}
			
                    $param_array = array();
                    //$param_array[1] = $this->report_session->post['ddlfilterby'];
					$param_array[1] = $this->report_session->post['ddlfilterby2'];
                   // $param_array[2] = implode(",",$chk_arr); 
					$param_array[2] = $datefield[0];
					$param_array[3] = $datefield[1];
					//print_r($param_array);
                   // print_r($this->report_session->post);exit;
                    $result_arr = $this->SFA_Comman->executequery('CALL SP_Productivity_Strike_Rate_New(?,?,?)',$param_array,'');
		//print_r($result_arr );exit;
		
         $count  = count($result_arr[0]);
		// echo "count::".$count;exit;
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
     
        if(!empty($result_arr[0])){
            foreach($result_arr[0] as $row) {
       
			 
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
      * @since      19-10-2012
      * @version    Release: 1
      * @author     PT <pankil@elantechnologies.com>
      * @copyright  Elan Technologies
      * @param
      *
      * This action fetch customer pending request data
      *
      */
    public function exportAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
          /*  if(!isset($this->report_session->routecode_str) && $this->report_session->routecode_str == "")
        {
			$sessionrouts=$this->report_session->routecode_str;
		}
		else
		{
			$sessionrouts=0;
		}*/
		 $this->report_session->post['ddlfilterby2']=implode(",",$this->report_session->post['ddlfilterby2']);
		
		   if($this->report_session->post['ddlfilterby2'] == "")
        {
			$this->report_session->post['ddlfilterby2']=0;
		}
        	$datefield=explode("-",$this->report_session->post['txt_route_end_date']);
					
                    $param_array = array();
                   // $param_array[1] = $this->report_session->post['ddlfilterby'];
					$param_array[1] = $this->report_session->post['ddlfilterby2'];
                   // $param_array[2] = implode(",",$chk_arr); 
					$param_array[2] = $datefield[0];
					$param_array[3] = $datefield[1];
                    //print_r($param_array);exit;
                    $result_arr = $this->SFA_Comman->executequery('CALL SP_Productivity_Strike_Rate_New(?,?,?)',$param_array,'');
					
					
        $report_title_height = 15;
        
        
        $data = $result_arr[0];
        $data_arr = array();
        
        $column_model_arr = array();
        $data_arr["columns"] = array($this->translate->_('division code'),$this->translate->_('salesmancode'),$this->translate->_('salesmanname1'),$this->translate->_('arbsalesmanname1'),$this->translate->_('Mtd_odometer'),$this->translate->_('plannedcalls'),$this->translate->_('actualcalls'),$this->translate->_('unschedulecall'),$this->translate->_('cashsale'),$this->translate->_('creditsale'),$this->translate->_('productivecalls'),$this->translate->_('totalreceipt'),$this->translate->_('strikerate'),$this->translate->_('productiverate'),$this->translate->_('CustomerFaceTime'),$this->translate->_('OTPUsedCount'),$this->translate->_('settlementskipeddays'));
        
        $data_arr["columns_config"] = array(array("width"=>50,"toaltext"=>$this->translate->_('Total')),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>10),
                                            array("width"=>12),
                                            array("width"=>10,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>12,"total"=>"1"),
                                            array("width"=>10,"total"=>"1"),
                                            array("width"=>12,"total"=>"1")
                                        );
        
        for($i = 0; $i < count($result_arr[0]); $i++)
        {
            $routename = ($this->session->lang == "ar_AR") ? $result_arr[0][$i]['arbroutename'] : $result_arr[0][$i]['routename'];
            $salesmanname = ($this->session->lang == "ar_AR") ? $result_arr[0][$i]['arbsalesmanname1'] : $result_arr[0][$i]['salesmanname1'];
            
            $column_model_arr[] = array($result_arr[0][$i]['divisioncode'],$result_arr[0][$i]['salesmancode'],$result_arr[0][$i]['salesmanname1'],
			$result_arr[0][$i]['arbsalesmanname1'],$result_arr[0][$i]['Mtd_odometer'],
                                        $result_arr[0][$i]['plannedcalls'], $result_arr[0][$i]['actualcalls'],
										$result_arr[0][$i]['unschedulecall'],
                                        $result_arr[0][$i]['cashsale'],$result_arr[0][$i]['creditsale'],$result_arr[0][$i]['productivecalls'],
										$result_arr[0][$i]['totalreceipt'],
                                        $result_arr[0][$i]['strikerate'],$result_arr[0][$i]['productiverate'],$result_arr[0][$i]['CustomerFaceTime'],
										$result_arr[0][$i]['OTPUsedCount'],
                                        $result_arr[0][$i]['settlementskipeddays']
                                        );
        }
		
		
		 
        
        $data_arr["columns_model"]          = $column_model_arr;
        $data_arr["config"]["report_title"] = $this->translate->_("Monthwise-strike-rate").$report_title;
        $data_arr["config"]["report_title_height"] = $report_title_height;
        $data_arr["config"]["file_name"]    = "Monthwise-strike-rate";
        $data_arr["config"]["group_level"]  = 0;
        $data_arr["config"]["total_columns"]= count($data_arr["columns"]);
        $data_arr["config"]["group_total"]  = "0";
        $data_arr["config"]["main_total"]   = "1";
        $data_arr["config"]["row_height"]   = 20;
        
        
        
        $SFA_Exportxls = new SFA_Exportxls($data_arr);
        $objPHPExcel = $SFA_Exportxls->exportxls();
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
        exit;
    }
}