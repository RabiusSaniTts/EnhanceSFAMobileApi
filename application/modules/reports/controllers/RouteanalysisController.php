<?php
/**
* @name       Reports_SalessummaryController
* @since      20-02-2012
* @version    Release: 7
* @author     GP <gayatri@elantechnologies.com>
* @copyright  Elan Technologies
* @param
*
* This controller is manage report module.
*/
class Reports_RouteanalysisController extends Reports_Library_Controller_Action_Abstract
{
    /**
    * @name       init
    * @since      15-02-2012
    * @version    Release: 1
    * @author     M@M <miral@elantechnologies.com>
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
		$this->css 			= $this->translate->_('CSS');
		$this->view->css	= $this->css;
        $this->view->colan	= $this->translate->_('Colan');
        $this->SFA_Comman	= new SFA_Comman();
        
        $this->currentUser = SFA_Loginauth::getIdentity();	
        if(!isset($this->currentUser) || empty($this->currentUser))
        {
           // SFA_Message::setMsg($this->translate->_('Do Login'));
           $this->_helper->redirector("index", "index", "home");
			$url = $this->view->baseUrl();
			echo '<script type="text/javascript">window.location="'.$url.'";</script>';
			exit;
        }
        
        $this->sec_lang = $this->view->sec_lang;
        $this->decimalplaces = $this->view->decimalplaces = $this->SFA_Comman->getdecimalplaces();
        $this->view->sec_lang = $this->SFA_Comman->getsecondlanguage();
        
        $this->report_session		= new Zend_Session_Namespace('Re_aandpreport');
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
	
    public function routeanalysisindexAction()
    {
        $this->view->params 	= $params = $this->getRequest()->getParams();
        $this->view->formdata  = $formdata = $this->_request->getPost();
        
        $this->view->itemgrid    = $this->view->BaseUrl("/".$params['module']."/ajaxdata/useraccessgrid");
        $this->report_session->post = array();
   }
   
   

    /**
    * @name       totalsalesbyhierarchyAction
    * @since      15-02-2012
    * @version    Release: 1
    * @author     GP <gayatri@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This action is for display daily sales sheet report
    *
    */
    public function indexAction()
    {
        $this->view->params 	= $params = $this->getRequest()->getParams();
		$result_arr = $this->SFA_Comman->executequery('CALL sp_combo_division()','','');
		$this->view->data = $result_arr;
        $this->view->formdata  = $formdata = $this->_request->getPost();
        
        $this->view->itemgrid    = $this->view->BaseUrl("/".$params['module']."/ajaxdata/useraccessgrid");
        $this->report_session->post = array();
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
    public function routeanalysisAction()
    {
		$this->_helper->layout->disableLayout();
        
        $this->view->params 	= $params = $this->getRequest()->getParams();
		//var_dump($this->view->params['ddlfilterby']); exit;
		
        //$result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_salessummary(?,?,?,?,?)',$param_array,'');
        $result_arr = $this->SFA_Comman->executequery('CALL proc_tts_route_cust_analysis(?)',$this->view->params['ddlfilterby'],'');
		$results = ["sEcho" => 1,
        	"iTotalRecords" => count($result_arr),
        	"iTotalDisplayRecords" => count($result_arr),
        	"aaData" => $result_arr ]; 

		//echo json_encode($results);  
		//$this->_helper->json($results);
		//var jsonData = json_encode($results);  
		
		//$this->view->rtparam = $this->report_session->routecode_str;
		//$this->view->dtparam = $this->report_session->post['txt_route_start_date'] ." to ". $this->report_session->post['txt_route_end_date']; //json_encode($result_arr); 
		$this->view->data = $result_arr; //json_encode($result_arr); 
    }
    
    
    /**
      * @name       exportAction
      * @since      15-02-2012
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
        
        if(isset($this->report_session->routecode_str) && $this->report_session->routecode_str != "")
        {
            $extra_where .= ' AND ih.routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND ih.actualtransactiondate BETWEEN "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'" AND "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] != "" && $this->report_session->post['txt_route_end_date'] == "")
        {
            $extra_where  .= ' AND ih.actualtransactiondate >= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_start_date'])).'"';
        }
        elseif($this->report_session->post['txt_route_start_date'] == "" && $this->report_session->post['txt_route_end_date'] != "")
        {
            $extra_where  .= ' AND ih.actualtransactiondate <= "'.date("Y-m-d",strtotime($this->report_session->post['txt_route_end_date'])).'"';
        }
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "routecode";}
        if(empty($sord)) {  $sord  = "asc";}
        
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = "routecode,hocode,transactiondate,".$sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        $param_array[6] = $this->currentUser->username;
        
        //$result_arr = $this->SFA_Comman->executequery('CALL sp_report_transaction_salessummary(?,?,?,?,?)',$param_array,'');
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_aandpreport_with_permission(?,?,?,?,?,?)',$param_array,'');
        
        $report_title_height = 15;
        for($i=0;$i<count($this->report_session->searchParams);$i++)
        {
            if($this->report_session->searchParams[$i]["value"] != "")
            {
                if($this->css == "ar_") {
                    $report_title .= "\r ".$this->report_session->searchParams[$i]["value"]." : ".$this->translate->_($this->report_session->searchParams[$i]["title"]);
                } else {
                    $report_title .= "\r ".$this->translate->_($this->report_session->searchParams[$i]["title"]) . " : ".$this->report_session->searchParams[$i]["value"];
                }
                $report_title_height += 10;
            }
        }
        
        $data = $result_arr[0];
        $data_arr = array();
        
        $column_model_arr = array();
        $data_arr["columns"] = array($this->translate->_('Route Code'),$this->translate->_( 'Transaction Date'),$this->translate->_('Transaction Time'),$this->translate->_('Invoice Number'),$this->translate->_('Salesman Code'),$this->translate->_('Customer Code'),$this->translate->_('Customer Name'),$this->translate->_('receiptnumber'),$this->translate->_('DEDUCTION Amount'));
        $data_arr["columns_config"] =   array(
                                            array("width"=>12),
                                            array("width"=>12),
                                            array("width"=>13),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>15),
                                            array("width"=>35),
                                            array("width"=>12,"toaltext"=>$this->translate->_('Total'),"group_total_text"=>$this->translate->_('Group Total')),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1")
                                          /*  array("width"=>15,"total"=>"1","group_total"=>"1")*/
                                        );
        for($i = 0; $i < count($result_arr[0]); $i++)
        {
			$routename 		= ($this->css == 'ar_') ? $result_arr[0][$i]['arbroutename'] 		: $result_arr[0][$i]['routename'];
			$customername 	= ($this->css == 'ar_') ? $result_arr[0][$i]['arbcustomername'] 	: $result_arr[0][$i]['customername'];
			$netamount = $result_arr[0][$i]['invoiceamount']-$result_arr[0][$i]['discountamount1'];
         /*   $column_model_arr[$result_arr[0][$i]['routecode']." - ".$routename][$result_arr[0][$i]['transactiondate']][] =
                                                array($result_arr[0][$i]['transactiontime'],$result_arr[0][$i]['invoicenumber'],$result_arr[0][$i]['salesmancode'],$result_arr[0][$i]['customercode'],$customername,
                                                    $result_arr[0][$i]['mop'],$result_arr[0][$i]['salesamount'],$result_arr[0][$i]['goodreturnamount'],$result_arr[0][$i]['totaldamagedamount'],
                                                    /*$result_arr[0][$i]['totalexpiryamount'],*//*$result_arr[0][$i]['freeamount'],$result_arr[0][$i]['invoiceamount'],$result_arr[0][$i]['discountamount1'],
                                                    $netamount,$result_arr[0][$i]['immediatepaid'],$result_arr[0][$i]['invoicebalance']);*/
			$column_model_arr[$result_arr[0][$i]['routecode']." - ".$routename][] = array($result_arr[0][$i]['transactiondate'],$result_arr[0][$i]['transactiontime'],$result_arr[0][$i]['invoicenumber'],$result_arr[0][$i]['salesmancode'],$result_arr[0][$i]['customercode'],$customername,
                                                    $result_arr[0][$i]['receiptnumber'],$result_arr[0][$i]['DEDUCTIONAMOUNT']);
        }
        //pr($column_model_arr,1);
        $data_arr["columns_model"]          = $column_model_arr;
        $data_arr["config"]["report_title"] = $this->translate->_("Sales Summary").$report_title;
        $data_arr["config"]["report_title_height"] = $report_title_height;
        $data_arr["config"]["file_name"]    = "SalesSummary";
       // $data_arr["config"]["group_level"]  = 2;
		$data_arr["config"]["group_level"]  = 1;
        $data_arr["config"]["total_columns"]= count($data_arr["columns"]);
        $data_arr["config"]["group_total"]  = "1";
        $data_arr["config"]["main_total"]   = "1";
        
//print_r($data_arr);
        $SFA_Exportxls = new SFA_Exportxls($data_arr);
        $objPHPExcel = $SFA_Exportxls->exportxls();
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
	//22	 header('Cache-Control: max-age=0');
        $objWriter->save('php://output');
		
        exit;
    }
}