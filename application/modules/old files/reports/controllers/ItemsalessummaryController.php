<?php
/**
* @name       ItemsalessummaryController
* @since      10-10-2012
* @version    Release: 1
* @author     PT <pankil@elantechnologies.com>
* @copyright  Elan Technologies
* @param
*
* This controller is manage report module.
*/
class Reports_ItemsalessummaryController extends Reports_Library_Controller_Action_Abstract
{
    /**
    * @name       init
    * @since      10-10-2012
    * @version    Release: 1
    * @author     PT <pankil@elantechnologies.com>
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
        
        $this->sec_lang 	  = $this->view->sec_lang;
        $this->decimalplaces  = $this->view->decimalplaces	= $this->SFA_Comman->getdecimalplaces();
        $this->view->sec_lang = $this->SFA_Comman->getsecondlanguage();
        
        $this->report_session   = new Zend_Session_Namespace('Re_itemsalessummary');
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
    * @name       returnorbuybacksummaryAction
    * @since      10-10-2012
    * @version    Release: 1
    * @author     PT <pankil@elantechnologies.com>
    * @copyright  Elan Technologies
    * @param
    *
    * This action is for display daily sales sheet report
    *
    */
    public function itemsalessummaryAction()
    {
        $this->view->params    = $params   = $this->getRequest()->getParams();
        $this->view->formdata  = $formdata = $this->_request->getPost();
		
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_data_sales_free_summary_detail()','','');
        
        $this->view->itemgrid    = $this->view->BaseUrl("/".$params['module']."/ajaxdata/useraccessgrid");
        $this->view->item_list = $result_arr[1];
        $this->view->majorcat_list = $result_arr[2];
        
        $this->report_session->post = array();
	}

    /**
    * @name       indexAction
    * @since      10-10-2012
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
        
        $this->view->ReportTitle = "Item Sales Summary";
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
        
        $this->view->searchParams  =  array(
                                            array("title"=> $this->filter_arr[$formdata['ddlfilterby']],
                                                  "value" => $title_val),
                                            array("title"=> "Items",
                                                 "value" => $formdata['ddlitem_selected']),
                                            array("title"=> "Major Category",
                                                  "value" => $formdata['ddlcategory_selected']),
                                            array("title"=> "Start Date",
                                                  "value" => ($formdata['txt_route_start_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_start_date'])) : ""),
                                            array("title"=> "End Date",
                                                  "value" => ($formdata['txt_route_end_date'] != "" ) ? date("d M Y",strtotime($formdata['txt_route_end_date'])) : "")
                                            );
        $this->report_session->searchParams = $this->view->searchParams;
        
        $this->view->xlsexport_link = $this->view->baseUrl()."/reports/itemsalessummary/export";
        $this->view->cvsexport_link = $this->view->baseUrl()."/reports/itemsalessummary/exportcsv";
    }
    /**
      * @name       pdcdataAction
      * @since      10-10-2012
      * @version    Release: 1
      * @author     PT <pankil@elantechnologies.com>
      * @copyright  Elan Technologies
      * @param
      *
      * This action fetch customer pending request data
      *
      */
    public function itemsalessummarydataAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
        $customertype = "";
        $customercode = "";
        
        if(isset($this->report_session->routecode_str) && $this->report_session->routecode_str != "")
        {
            $extra_where .= ' AND ih.routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['ddlcategory'] != "" )
        {
            $extra_where  .= " and mg.majorcategorycode = ".$this->report_session->post['ddlcategory'];
        }
        if($this->report_session->post['ddlitem'] != "" )
        {
            $extra_where  .= " and im.actualitemcode = ".$this->report_session->post['ddlitem'];
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
        $param_array[2] = $sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_dataanalysis_itemsalessummary(?,?,?,?,?)',$param_array,'');
        
        $count  = $result_arr[0][0]['counter'];
        if( $count >0 ) {
            $total_pages = ceil($count/$limit);
        } else {
            $total_pages = 0;
        }
        if ($page > $total_pages) $page = $total_pages;
        $start = $limit*$page - $limit; // do not put $limit*($page - 1)
    
        $responce->page = $page;
        $responce->total = $total_pages;
        $responce->records = $count;
        $i=0;
        
        $totalsalesamount = $totalreturnamount = $totaldamagedamount = $totalexpiryamount = $totalfreesampleamount = 0;
        $salesqty = $freesampleqty = $damagedqty = $expiryqty = $returnqty = $defaultsalesprice = $sales_invprice = $damage_stdprice = $damage_invprice = $expired_stdprice = $expired_invprice = $goodretun_stdprice = $goodretun_invprice = $invdiscountbreakup = $itempromodiscount = $freegods_stdprice = $final_netamount = $sales_defprice = $final_totalfoc = 0;
        if(!empty($result_arr[1])){
            foreach($result_arr[1] as $row) {
                //$responce->rows[$i]['id'] = $i;
                //$responce->rows[$i]['cell'] = array($row['majorcategorycode'].' - '.$row['majorcategory'],$row['itemcode'],$row['itemdescription'],$row['unitspercase'],
                //                                $row['value'], $row['description']
                //                                );
                //$i++;
                $totalfoc = $row['freegods_stdprice']+$row['invdiscountbreakup']+$row['itempromodiscount']+$row['sales_defprice']+$row['sales_invprice']+$row['damage_stdprice']+$row['damage_invprice']+$row['expired_stdprice']+$row['expired_invprice']+$row['goodretun_stdprice']+$row['goodretun_invprice'];
                $netamount = $row['sales_invprice']+$row['damage_invprice']+$row['expired_invprice']+$row['goodretun_invprice']+$row['invdiscountbreakup']+$row['itempromodiscount'];
                $salesqty += $row['salesqty'];
                $freesampleqty += $row['freesampleqty'];
                $damagedqty += $row['damagedqty'];
                $expiryqty += $row['expiryqty'];
                $returnqty += $row['returnqty'];
                $defaultsalesprice += $row['defaultsalesprice'];
                $sales_invprice += $row['sales_invprice'];
                $damage_stdprice += $row['damage_stdprice'];
                $damage_invprice += $row['damage_invprice'];
                $expired_stdprice += $row['expired_stdprice'];
                $expired_invprice += $row['expired_invprice'];
                $goodretun_stdprice += $row['goodretun_stdprice'];
                $goodretun_invprice += $row['goodretun_invprice'];
                $invdiscountbreakup += $row['invdiscountbreakup'];
                $itempromodiscount += $row['itempromodiscount'];
                $freegods_stdprice += $row['freegods_stdprice'];
                $final_netamount += $netamount;
                $sales_defprice += $row['sales_defprice'];
                $final_totalfoc += $totalfoc;
                
                $majorcategory = ($this->css == 'ar_') ? $row['arbdescription'] : $row['majorcategory'];
                $itemdescription = ($this->css == 'ar_') ? $row['arbitemdescription'] : $row['itemdescription'];
                
                $responce->rows[$i]['id'] = $i;
                $responce->rows[$i]['cell'] = array($row['majorcategorycode'].' - '.$majorcategory,$row['itemcode'], $itemdescription,
                                                    $row['unitspercase'],$row['salesqty'],$row['freesampleqty'],$row['damagedqty'], $row['expiryqty'],
                                                    $row['returnqty'], $row['defaultsalesprice'], $row['sales_invprice'], $row['damage_stdprice'],
                                                    $row['damage_invprice'], $row['expired_stdprice'], $row['expired_invprice'], $row['goodretun_stdprice'],
                                                    $row['goodretun_invprice'], $row['invdiscountbreakup'], $row['itempromodiscount'], $row['freegods_stdprice'],
                                                    $netamount, $row['sales_defprice'],$totalfoc);
                $i++;
            }
        }
        else
        {
          //  $responce->rows[$i]['id']=1;
          //  $responce->rows[$i]['cell']=array("","","","No Record Founds","", "");
        }
        $responce->userdata['itemdescription'] = $this->translate->_("Total");
        $responce->userdata['salesqty'] = $salesqty;
        $responce->userdata['freesampleqty'] = $freesampleqty;
        $responce->userdata['damagedqty'] = $damagedqty;
        $responce->userdata['expiryqty'] = $expiryqty;
        $responce->userdata['returnqty'] = $returnqty;
        $responce->userdata['defaultsalesprice'] = $defaultsalesprice;
        $responce->userdata['sales_invprice'] = $sales_invprice;
        $responce->userdata['damage_stdprice'] = $damage_stdprice;
        $responce->userdata['damage_invprice'] = $damage_invprice;
        $responce->userdata['expired_stdprice'] = $expired_stdprice;
        $responce->userdata['expired_invprice'] = $expired_invprice;
        $responce->userdata['goodretun_stdprice'] = $goodretun_stdprice;
        $responce->userdata['goodretun_invprice'] = $goodretun_invprice;
        $responce->userdata['invdiscountbreakup'] = $invdiscountbreakup;
        $responce->userdata['itempromodiscount'] = $itempromodiscount;
        $responce->userdata['freegods_stdprice'] = $freegods_stdprice;
        $responce->userdata['netamount'] = $final_netamount;
        $responce->userdata['sales_defprice'] = $sales_defprice;
        $responce->userdata['totalfoc'] = $final_totalfoc;
        
        echo json_encode($responce);
        exit;
    }
    
    
    /**
      * @name       exportAction
      * @since      15-02-2012
      * @version    Release: 1
      * @author     GP <gayatri@elantechnologies.com>
      * @copyright  Elan Technologies
      * @param
      *
      * This action Actually bind datasource
      *
      */
    public function exportAction()
    {
        $this->view->params = $params = $this->getRequest()->getParams();
        $this->view->formdata = $formdata = $this->_request->getPost();
        $this->view->css 		= $this->translate->_('CSS');
        $extra_where = "";
        $customertype = "";
        $customercode = "";
        
        if(isset($this->report_session->routecode_str) && $this->report_session->routecode_str != "")
        {
            $extra_where .= ' AND ih.routecode IN ('.$this->report_session->routecode_str.')';
        }
        if($this->report_session->post['ddlcategory'] != "" )
        {
            $extra_where  .= " and mg.majorcategorycode = ".$this->report_session->post['ddlcategory'];
        }
        if($this->report_session->post['ddlitem'] != "" )
        {
            $extra_where  .= " and im.actualitemcode = ".$this->report_session->post['ddlitem'];
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
        $param_array[2] = "majorcategorycode,".$sidx;
        $param_array[3] = $sord;
        $param_array[4] = $limit;
        $param_array[5] = $page;
        
        $result_arr = $this->SFA_Comman->executequery('CALL sp_report_dataanalysis_itemsalessummary(?,?,?,?,?)',$param_array,'');
        
        $report_title_height = 15;
        for($i=0;$i<count($this->report_session->searchParams);$i++)
        {
            if($this->report_session->searchParams[$i]["value"] != "")
            {
                if($this->css == 'ar_') {
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
        $data_arr["columns"] = array($this->translate->_('Item Group'),$this->translate->_('Item Code'),$this->translate->_('Item Description'),$this->translate->_('UPC'),$this->translate->_('Sales Qty'),$this->translate->_('Free Qty'),$this->translate->_('Damaged Qty'),$this->translate->_('Expired Qty'),$this->translate->_('Good Ret. Qty'),$this->translate->_('Sales @ Std. Price'),$this->translate->_('Sales @ Inv. Price'),$this->translate->_('Damage Ret @ Std. Price'),$this->translate->_('Damage Ret @ Inv. Price'),$this->translate->_('Expired Ret @ Std. Price'),$this->translate->_('Expired Ret @ Inv. Price'),$this->translate->_('Good Return @ Std. Price'),$this->translate->_('Good Return @ Inv. Price'),$this->translate->_('Inv. Discount Break Up'),$this->translate->_('Item Discount Break Up'),$this->translate->_('Free Goods @ Std. Price'),$this->translate->_('Net Sales'),$this->translate->_('Price Difference'),$this->translate->_('Total FOC'));
        $data_arr["columns_config"] =   array(
                                            array("width"=>12),
                                            array("width"=>15),
                                            array("width"=>35),
                                            array("width"=>13,"toaltext"=>$this->translate->_('Total'),"group_total_text"=>$this->translate->_('Group Total')),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>13,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1"),
                                            array("width"=>15,"total"=>"1","group_total"=>"1")
                                        );
        for($i = 0; $i < count($result_arr[0]); $i++)
        {
            $totalfoc = $result_arr[0][$i]['freegods_stdprice']+$result_arr[0][$i]['invdiscountbreakup']+$result_arr[0][$i]['itempromodiscount']+$result_arr[0][$i]['sales_defprice']+$result_arr[0][$i]['sales_invprice']+$result_arr[0][$i]['damage_stdprice']+$result_arr[0][$i]['damage_invprice']+$result_arr[0][$i]['expired_stdprice']+$result_arr[0][$i]['expired_invprice']+$result_arr[0][$i]['goodretun_stdprice']+$result_arr[0][$i]['goodretun_invprice'];
            $netamount = $result_arr[0][$i]['sales_invprice']+$result_arr[0][$i]['damage_invprice']+$result_arr[0][$i]['expired_invprice']+$result_arr[0][$i]['goodretun_invprice']+$result_arr[0][$i]['invdiscountbreakup']+$result_arr[0][$i]['itempromodiscount'];
            
            $routename = ($this->css == 'ar_') ? $result_arr[0][$i]['arbroutename'] : $result_arr[0][$i]['routename'];
            $salesmanname = ($this->css == 'ar_') ? $result_arr[0][$i]['arbsalesmanname1'] : $result_arr[0][$i]['salesmanname1'];
            $majorcategory = ($this->css == 'ar_') ? $result_arr[0][$i]['arbdescription'] : $result_arr[0][$i]['majorcategory'];
            $itemdescription = ($this->css == 'ar_') ? $result_arr[0][$i]['arbitemdescription'] : $result_arr[0][$i]['itemdescription'];
            
            $column_model_arr[$result_arr[0][$i]['majorcategorycode'].' - '.$majorcategory][] =  array($result_arr[0][$i]['itemcode'], $itemdescription,
                                        $result_arr[0][$i]['unitspercase'],$result_arr[0][$i]['salesqty'],$result_arr[0][$i]['freesampleqty'],$result_arr[0][$i]['damagedqty'], $result_arr[0][$i]['expiryqty'],
                                        $result_arr[0][$i]['returnqty'], $result_arr[0][$i]['defaultsalesprice'], $result_arr[0][$i]['sales_invprice'], $result_arr[0][$i]['damage_stdprice'],
                                        $result_arr[0][$i]['damage_invprice'], $result_arr[0][$i]['expired_stdprice'], $result_arr[0][$i]['expired_invprice'], $result_arr[0][$i]['goodretun_stdprice'],
                                        $result_arr[0][$i]['goodretun_invprice'], $result_arr[0][$i]['invdiscountbreakup'], $result_arr[0][$i]['itempromodiscount'], $result_arr[0][$i]['freegods_stdprice'],
                                        $netamount, $result_arr[0][$i]['sales_defprice'],$totalfoc);
        }
        
        $data_arr["columns_model"]          = $column_model_arr;
        $data_arr["config"]["report_title"] = $this->translate->_("Item Sales Summary").$report_title;
        $data_arr["config"]["report_title_height"] = $report_title_height;
        $data_arr["config"]["file_name"]    = "Item_Sales_Summary";
        $data_arr["config"]["group_level"]  = 1;
        $data_arr["config"]["total_columns"]= count($data_arr["columns"]);
        $data_arr["config"]["group_total"]  = "1";
        $data_arr["config"]["main_total"]   = "1";
        
        
        $SFA_Exportxls = new SFA_Exportxls($data_arr);
        $objPHPExcel = $SFA_Exportxls->exportxls();
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
        exit;
    }
}