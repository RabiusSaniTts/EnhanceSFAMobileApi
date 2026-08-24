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
class Reports_CustomeractivemslController extends Reports_Library_Controller_Action_Abstract
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
        
        $this->sec_lang 	                        	= $this->view->sec_lang;
        $this->decimalplaces  = $this->view->decimalplaces	= $this->SFA_Comman->getdecimalplaces();
        $this->view->sec_lang	                        	= $this->SFA_Comman->getsecondlanguage();
        
        $this->report_session		= new Zend_Session_Namespace('Re_customeractivemsl');
        $this->css 				= $this->translate->_('CSS');
		$this->view->css 		= $this->css;
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
        $getparams_init = $this->getRequest()->getParams();
        $getpost_init = $this->_request->getPost();
        
        if(in_array($getparams_init['action'],$this->current_read_delete_arr))
        {
            if(!$this->checkaccess("read")) {
                
                $this->_forward('noaccess','aclaccess','home', array("actiontype"=>"read","modulename"=>$this->currentmodulename));
                
            }
        }
        
    } 
    public function customeractivemslAction()
    {
        $this->view->params 	= $params = $this->getRequest()->getParams();
        $this->view->formdata  = $formdata = $this->_request->getPost();
		
		$result_arr = $this->SFA_Comman->executequery('CALL sp_combo_routemaster()','','');
        $this->view->route_list = $result_arr[0];
		$result_arr = $this->SFA_Comman->executequery('CALL sp_combo_itemmust()','','');
        $this->view->msl_list = $result_arr[0];
		
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
        $this->view->params 	= $params   = $this->getRequest()->getParams();
        $this->view->formdata   = $formdata = $this->_request->getPost();
        
        $this->report_session->post   = $formdata;
        $this->view->ReportTitle  = "Customer Active MSL";
        $this->view->pageHeaderTitle  = $this->translate->_('Date');
        $this->view->pageHeadervalue  =  date("m/d/Y h:i:s");
        $this->view->searchParams =    array(
                                              array("title"=> "Route",
                                                  "value"=> $formdata['ddlroute_selected']),
											  array("title"=> "MSL",
                                                  "value"=> $formdata['ddlmsl_selected'])
                                        );
        $this->report_session->searchParams = $this->view->searchParams;
        
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/customeractivemsl/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/customeractivemsl/exportcsv";
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
    public function custactivemsldataAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
      
           if(isset($this->report_session->post['ddlroute'] ) && $this->report_session->post['ddlroute']  != "")
        {
            $extra_where .= ' AND rs.routecode =  "'.$this->report_session->post['ddlroute'].'"';
        }
		if(isset($this->report_session->post['ddlmsl'] ) && $this->report_session->post['ddlmsl']  != "")
        {
            $extra_where .= ' AND imd.itemmustcode =  "'.$this->report_session->post['ddlmsl'].'"';
        }
				
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "itemcode";  }
        if(empty($sord)) {  $sord  = "asc";  }
        
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_customer_active_msl(?,?,?,?,?,?)',$param_array,'');
        
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
               
                $responce->rows[$i]['id']  = $i;
                $responce->rows[$i]['cell']= array($row['itemmustkey'],$row['itemmustdescription'],$row['alternatecode'],$row['categoryname'],$row['channelname'],$row['customername'],$row['itemcode'],$row['quantity'],$row['max_quantity']);
                $i++;
              
            }
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
        
       if(isset($this->report_session->post['ddlroute'] ) && $this->report_session->post['ddlroute']  != "")
        {
            $extra_where .= ' AND rs.routecode =  "'.$this->report_session->post['ddlroute'].'"';
        }
		if(isset($this->report_session->post['ddlmsl'] ) && $this->report_session->post['ddlmsl']  != "")
        {
            $extra_where .= ' AND imd.itemmustcode =  "'.$this->report_session->post['ddlmsl'].'"';
        }
        
        
        $page = $_GET['page']; // get the requested page
        $limit = $_GET['rows']; // get how many rows we want to have into the grid
        $sidx = $_GET['sidx']; // get index row - i.e. user click to sort
        $sord = $_GET['sord']; // get the direction
        if(!$sidx) $sidx =1;
        
        if(empty($sidx)) {  $sidx  = "itemcode";}
        if(empty($sord)) {  $sord  = "asc";}
    
        $param_array = array();
        $param_array[1] = $extra_where;
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_customer_active_msl(?,?,?,?,?)',$param_array,'');
        
        $report_title_height = 15;
        for($i=0;$i< count($this->report_session->searchParams);$i++)
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
        $data_arr["columns"] = array($this->translate->_('Item Must Code'),$this->translate->_('Item Must Description'),$this->translate->_('Customer Code'),$this->translate->_('Customer Group'),$this->translate->_('Customer Channel'),$this->translate->_('Customer Name'),$this->translate->_('Item Code'),$this->translate->_('Min Order Qnty'),$this->translate->_('Max Order Qnty'));
        $data_arr["columns_config"] =   array(
                                            array("width"=>12),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>15),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13),
                                            array("width"=>13)
                                        );
        for($i = 0; $i < count($data); $i++)
        {

            $column_model_arr[] = array($data[$i]['itemmustkey'],$data[$i]['itemmustdescription'],$data[$i]['alternatecode'],$data[$i]['categoryname'],$data[$i]['channelname'],$data[$i]['customername'],$data[$i]['itemcode'],$data[$i]['quantity'],$data[$i]['max_quantity']);
			//array($data[$i]['routecode'],$routename,$data[$i]['customercode'],$customername,$data[$i]['itemcode'],$itemshortdescription,$data[$i]['salesmancode'],$salesmanname,$data[$i]['channel'],$data[$i]['alternateitemgroupcode'],$data[$i]['Outlet_Quality']) 
        }
        //pr($column_model_arr,1);
        $data_arr["columns_model"]          		= $column_model_arr;
        $data_arr["config"]["report_title"] 		= $this->translate->_('Customer MSL List').$report_title;
        $data_arr["config"]["report_title_height"] 	= $report_title_height;
        $data_arr["config"]["file_name"]    		= "Customer MSL List";
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
    
    /**
    * @name       getcustomersAction
    * @since      05-10-2012
    * @version    Release: 1
    * @author     HD <hiren.d@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This action is for getting  customer info on the basis of the customer type.
    *
    */
    public function getcustomersAction()
    {
        $params = $this->getRequest()->getParams();
		
		$param_array = array();
        $param_array[1] = $params['cust_type'];
        $param_array[2] = 1;
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_account_customerpendingbalance_detail(?,?)',$param_array,'');
        echo Zend_Json::encode($result_arr);
		exit;
	}
}