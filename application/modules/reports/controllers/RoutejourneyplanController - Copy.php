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
class Reports_RoutejourneyplanController extends Reports_Library_Controller_Action_Abstract
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
		
		$this->report_session	= new Zend_Session_Namespace('Re_routeitemreturns');
    }

    public function routejourneyplansAction()
    {
        $this->view->params 	= $params = $this->getRequest()->getParams();
        $this->view->formdata  = $formdata = $this->_request->getPost();
        
        //$result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_route_review_detail()','','');
        //$this->view->route_list = $result_arr[0];
			$result 		= $this->SFA_Comman->executequery('CALL sp_get_weekstart_day()','','');
			$day_of_week	= $result[1][0]['weekstartday'];
			$start_of_day_week 		= $day_of_week+1;
			$end_of_day_week 		= $day_of_week+8;
			
			$day_name = array();
		$j=0;
		for($i=$start_of_day_week;$i<$end_of_day_week;$i++)
		{
			$datashow = $i;
			if($i >= 7)
			{
			$datashow = $i % 7;
			}
			$dayname 		 = date("l",mktime(0,0,0,10,$datashow,date('y')));
			$day_name[$j]['val'] = $dayname;
			$day_name[$j]['id']  = strtolower(substr($dayname,0,3))."_".($j+1);
			$j++;
		}
		$this->view->day_name = $day_name;
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
       
        $this->view->ReportTitle = "Route Journey Plan";
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
                    
                    $result_arr = $this->SFA_Comman->executequery('CALL sp_report_common_get_report_jp(?,?)',$param_array,'');
                    
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
       //  print_r($this->view->searchParams);
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/routejourneyplan/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/routejourneyplan/exportcsv";
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
    public function routejourneyplandataAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
	
		
        if(isset($this->report_session->routecode_str) && $this->report_session->routecode_str != "")
        {
            $extra_where .= ' AND rs.routecode IN ('.$this->report_session->routecode_str.')';
        }
		$seprate_day	= explode('_',$this->report_session->post['ddlday']);
		
		if($seprate_day[1] <> ""){
			$extra_where  .= ' AND rs.callrestrictiondays'.$seprate_day[1] .' = 1';
		}
     
      
        $columns ='rm.alternateroutecode as routecode,cm.alternatecode as customercode,callrestrictiondays1 AS Monday,monseq AS MondaySequence,callrestrictiondays2 AS Tuesday ,tueseq AS TuesdaySeqence,callrestrictiondays3 AS Wednesday,wedseq AS WednesdaySequence,callrestrictiondays4 AS Thursday,thuseq AS ThursdaySequence,callrestrictiondays5 AS Friday,friseq AS FridaySequence,callrestrictiondays6 AS Saturday,satseq AS SaturdaySequence,callrestrictiondays7 AS Sunday ,sunseq AS SundaySequence, rm.routename,rm.arbroutename,cm.customername, cm.arbcustomername, cm.customeraddress1, cm.customeraddress2, cm.customeraddress3, chm.channelname, Grouping_Code,Outlet_Quality,graceperiod, cm.creditlimit, creditlimitdays, payment_mode(invoicepaymentterms) AS invoicepaymentterms, rp32weeknumber';
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "rs.routecode";}
        if(empty($sord)) {  $sord  = "asc";}
    
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        $param_array[6] = $columns;
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_route_journey_plan(?,?,?,?,?)',$param_array,'');
        
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
				$customername 			= ($this->css == 'ar_') ? $row['arbcustomername'] 	: $row['customername'];
                
                $responce->rows[$i]['id']=$i;
                $responce->rows[$i]['cell']=array($row['routecode'],$routename,$row['customercode'],$customername,$row['invoicepaymentterms'],$row['creditlimit'],$row['creditlimitdays'],$row['graceperiod'],$row['customeraddress1'],$row['customeraddress2'],$row['customeraddress3'],$row['rp32weeknumber'],($row["Monday"] == 0 ? '':$row["Monday"]),($row['MondaySequence'] == 0? '':$row['MondaySequence']),($row["Tuesday"] == 0? '':$row["Tuesday"]),($row['TuesdaySeqence'] == 0?'':$row['TuesdaySeqence']),($row["Wednesday"] == 0? '' :$row["Wednesday"]),($row['WednesdaySequence'] == 0?'':$row['WednesdaySequence']),($row["Thursday"] == 0?'':$row["Thursday"]),($row['ThursdaySequence'] == 0? '':$row['ThursdaySequence']),($row["Friday"] == 0? '':$row["Friday"]),($row['FridaySequence']==0?'':$row['FridaySequence']),($row["Saturday"]==0?'':$row["Saturday"]),($row['SaturdaySequence']==0?'':$row['SaturdaySequence']),($row["Sunday"]==0?'':$row["Sunday"]),($row['SundaySequence']==0?'':$row['SundaySequence']),$row['channelname'],$row['Grouping_Code'],$row['Outlet_Quality']);
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
            $extra_where .= ' AND rs.routecode IN ('.$this->report_session->routecode_str.')';
        }
        $seprate_day	= explode('_',$this->report_session->post['ddlday']);
		
		if($seprate_day[1] <> ""){
			$extra_where  .= ' AND rs.callrestrictiondays'.$seprate_day[1] .' = 1';
		}
        $columns ='rm.alternateroutecode as routecode,cm.alternatecode as customercode,callrestrictiondays1 AS Monday,monseq AS MondaySequence,callrestrictiondays2 AS Tuesday ,tueseq AS TuesdaySeqence,callrestrictiondays3 AS Wednesday,wedseq AS WednesdaySequence,callrestrictiondays4 AS Thursday,thuseq AS ThursdaySequence,callrestrictiondays5 AS Friday,friseq AS FridaySequence,callrestrictiondays6 AS Saturday,satseq AS SaturdaySequence,callrestrictiondays7 AS Sunday ,sunseq AS SundaySequence, rm.routename,rm.arbroutename,cm.customername, cm.arbcustomername, cm.customeraddress1, cm.customeraddress2, cm.customeraddress3, chm.channelname, Grouping_Code,Outlet_Quality,graceperiod, cm.creditlimit, creditlimitdays, payment_mode(invoicepaymentterms) AS invoicepaymentterms, rp32weeknumber';
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "rs.routecode";}
        if(empty($sord)) {  $sord  = "asc";}
    
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        $param_array[6] = $columns;
		
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_route_journey_plan(?,?,?,?,?)',$param_array,'');
        
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
        $data_arr["columns"] = array($this->translate->_('Route Code'),$this->translate->_('Route Name'),$this->translate->_('Customer Code'),$this->translate->_('Customer'),$this->translate->_('MOP'),$this->translate->_('Credit Limit'),$this->translate->_('Credit Days'),$this->translate->_('Grace Period'),$this->translate->_('Customer Address1'),$this->translate->_('Customer Address2'),$this->translate->_('Customer Address3'),	$this->translate->_('Week'),$this->translate->_('Monday'),$this->translate->_('DaySeq'),$this->translate->_('Tuesday'),$this->translate->_('DaySeq'),$this->translate->_('Wednesday'),$this->translate->_('DaySeq'),$this->translate->_('Thursday'),$this->translate->_('DaySeq'),$this->translate->_('Friday'),$this->translate->_('DaySeq'),$this->translate->_('Saturday'),$this->translate->_('DaySeq'),$this->translate->_('Sunday'),$this->translate->_('DaySeq'),$this->translate->_('Channel'),$this->translate->_('Grouping Code'),$this->translate->_('Outlet Quality'));
        $data_arr["columns_config"] =   array(
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
                                            array("width"=>13),
											array("width"=>13),
                                            array("width"=>13),
											array("width"=>13),
                                            array("width"=>13),
											array("width"=>13),
                                            array("width"=>13),
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
				$routename 		= ($this->css == 'ar_') ? $data[$i]['arbroutename'] 	: $data[$i]['routename'];
				$salesmanname	= ($this->css == 'ar_') ? $data[$i]['arbsalesmanname1'] 	: $data[$i]['salesmanname1'];

            $column_model_arr[] = array($data[$i]['routecode'],$routename,$data[$i]['customercode'],$customername,$data[$i]['invoicepaymentterms'],$data[$i]['creditlimit'],$data[$i]['creditlimitdays'],$data[$i]['graceperiod'],$data[$i]['customeraddress1'],$data[$i]['customeraddress2'],$data[$i]['customeraddress3'],$data[$i]['rp32weeknumber'],			($data[$i]["Monday"] == 0 ? '':$data[$i]["Monday"]),($data[$i]['MondaySequence'] == 0? '':$data[$i]['MondaySequence']),($data[$i]["Tuesday"] == 0? '':$data[$i]["Tuesday"]),($data[$i]['TuesdaySeqence'] == 0?'':$data[$i]['TuesdaySeqence']),($data[$i]["Wednesday"] == 0? '' :$data[$i]["Wednesday"]),($data[$i]['WednesdaySequence'] == 0?'':$data[$i]['WednesdaySequence']),($data[$i]["Thursday"] == 0?'':$data[$i]["Thursday"]),($data[$i]['ThursdaySequence'] == 0? '':$data[$i]['ThursdaySequence']),($data[$i]["Friday"] == 0? '':$data[$i]["Friday"]),($data[$i]['FridaySequence']==0?'':$data[$i]['FridaySequence']),($data[$i]["Saturday"]==0?'':$data[$i]["Saturday"]),($data[$i]['SaturdaySequence']==0?'':$data[$i]['SaturdaySequence']),($data[$i]["Sunday"]==0?'':$data[$i]["Sunday"]),($data[$i]['SundaySequence']==0?'':$data[$i]['SundaySequence']),$data[$i]['channelname'],$data[$i]['Grouping_Code'],$data[$i]['Outlet_Quality']);
        }
        //pr($column_model_arr,1);
        $data_arr["columns_model"]          		= $column_model_arr;
        $data_arr["config"]["report_title"] 		= $this->translate->_('Route Journey Plan').$report_title;
        $data_arr["config"]["report_title_height"] 	= $report_title_height;
        $data_arr["config"]["file_name"]    		= "Route Journey Plan";
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