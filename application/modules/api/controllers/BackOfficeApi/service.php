
public function rp_chainAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_chain = $data["rp_chain"]; 

foreach($rp_chain as $key=>$val) {

$param = array();
$param[1] = trim($val["CustomerCode"]);
$param[2] = trim($val["ChainCode"]);
$param[3] = trim($val["CustomerName"]);
$param[4] = trim($val["Channel"]);
$param[5] = trim($val["CreditLimit"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_chain(?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_customerAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_customer = $data["rp_customer"]; 

foreach($rp_customer as $key=>$val) {

$param = array();
$param[1] = trim($val["Division_Code"]);
$param[2] = trim($val["CustomerCode"]);
$param[3] = trim($val["HeadOfficeCode"]);
$param[4] = trim($val["RouteCode"]);
$param[5] = trim($val["CustType"]);
$param[6] = trim($val["CustomerName"]);
$param[7] = trim($val["CustomerAddress1"]);
$param[8] = trim($val["CustomerAddress2"]);
$param[9] = trim($val["CustomerAddress3"]);
$param[10] = trim($val["Contact Name"]);
$param[11] = trim($val["InvoicePaymentTerms"]);
$param[12] = trim($val["CreditLimit"]);
$param[13] = trim($val["GracePeriod"]);
$param[14] = trim($val["Active"]);
$param[15] = trim($val["PricingKey"]);
$param[16] = trim($val["Memo1"]);
$param[17] = trim($val["Memo2"]);
$param[18] = trim($val["Territory"]);
$param[19] = trim($val["Class"]);
$param[20] = trim($val["Region"]);
$param[21] = trim($val["Cust_Disc_Code"]);
$param[22] = trim($val["Transaction_Anals3"]);
$param[23] = trim($val["Alpha"]);
$param[24] = trim($val["Transaction_Anals2"]);
$param[25] = trim($val["control_account"]);
$param[26] = trim($val["Grouping_Code"]);
$param[27] = trim($val["Outlet_Quality"]);
$param[28] = trim($val["OrderLocation"]);
$param[29] = trim($val["Credit_Days"]);
$param[30] = trim($val["CreditTerms"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_customer(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_glmatrixAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_glmatrix = $data["rp_glmatrix"]; 

foreach($rp_glmatrix as $key=>$val) {

$param = array();
$param[1] = trim($val["Division_Code"]);
$param[2] = trim($val["cost_of_sales"]);
$param[3] = trim($val["sales_account"]);
$param[4] = trim($val["cost_of_sales_acc"]);
$param[5] = trim($val["stock_account"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_glmatrix(?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_itemAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_item = $data["rp_item"]; 

foreach($rp_item as $key=>$val) {

$param = array();
$param[1] = trim($val["Division_Code"]);
$param[2] = trim($val["ItemCode"]);
$param[3] = trim($val["description"]);
$param[4] = trim($val["long_description"]);
$param[5] = trim($val["upc"]);
$param[6] = trim($val["sellingprcbyunit"]);
$param[7] = trim($val["retunprcbyunit"]);
$param[8] = trim($val["sellingprcbyct"]);
$param[9] = trim($val["retunprcbyct"]);
$param[10] = trim($val["Active"]);
$param[11] = trim($val["memo1"]);
$param[12] = trim($val["memo2"]);
$param[13] = trim($val["analysis_x_ref"]);
$param[14] = trim($val["purchase_key"]);
$param[15] = trim($val["nominal_key"]);
$param[16] = trim($val["analysis_x_ref1"]);
$param[17] = trim($val["brand"]);
$param[18] = trim($val["Category"]);
$param[19] = trim($val["Sub_Category"]);
$param[20] = trim($val["Barcode"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_item(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_itemgroupAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_itemgroup = $data["rp_itemgroup"]; 

foreach($rp_itemgroup as $key=>$val) {

$param = array();
$param[1] = trim($val["ItemGroupCode"]);
$param[2] = trim($val["SubMajorcategoryCode"]);
$param[3] = trim($val["ItemGroupName"]);
$param[4] = trim($val["ActiveStatus"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_itemgroup(?,?,?,?)',$param,'');
}
exit;
}
public function rp_outstandingAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_outstanding = $data["rp_outstanding"]; 

foreach($rp_outstanding as $key=>$val) {

$param = array();
$param[1] = trim($val["InvoiceNumber"]);
$param[2] = trim($val["RouteCode"]);
$param[3] = trim($val["SalesmanCode"]);
$param[4] = trim($val["TransactionDate"]);
$param[5] = trim($val["CustomerCode"]);
$param[6] = trim($val["TotalInvoiceAmount"]);
$param[7] = trim($val["InvoiceBalance"]);
$param[8] = trim($val["PaymentType"]);
$param[9] = trim($val["PDCIndicator"]);
$param[10] = trim($val["refernce"]);
$param[11] = trim($val["analysis_codes2"]);
$param[12] = trim($val["CustType"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_outstanding(?,?,?,?,?,?,?,?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_routeAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_route = $data["rp_route"]; 

foreach($rp_route as $key=>$val) {

$param = array();
$param[1] = trim($val["DivisionCode"]);
$param[2] = trim($val["RouteCode"]);
$param[3] = trim($val["RouteName"]);
$param[4] = trim($val["SalesmanCode"]);
$param[5] = trim($val["Region"]);
$param[6] = trim($val["MainWhCode"]);
$param[7] = trim($val["ActiveStatus"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_route(?,?,?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_smanAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_sman = $data["rp_sman"]; 

foreach($rp_sman as $key=>$val) {

$param = array();
$param[1] = trim($val["SalesmanCode"]);
$param[2] = trim($val["SalesmanName1"]);
$param[3] = trim($val["ANSalesmanCode"]);
$param[4] = trim($val["SupervisorCode"]);
$param[5] = trim($val["VehRegNum"]);
$param[6] = trim($val["ActiveStatus"]);
$param[7] = trim($val["SalesType"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_sman(?,?,?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_sppricingAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_sppricing = $data["rp_sppricing"]; 

foreach($rp_sppricing as $key=>$val) {

$param = array();
$param[1] = trim($val["PricingKey"]);
$param[2] = trim($val["ItemCode"]);
$param[3] = trim($val["Description"]);
$param[4] = trim($val["StartDate"]);
$param[5] = trim($val["EndDate"]);
$param[6] = trim($val["SpecialCasePrice"]);
$param[7] = trim($val["SpecialPiecePrice"]);
$param[8] = trim($val["SpecialReturnCasePrice"]);
$param[9] = trim($val["SpecialReturnPrice"]);
$param[10] = trim($val["Status"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_sppricing(?,?,?,?,?,?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_startloadAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_startload = $data["rp_startload"]; 

foreach($rp_startload as $key=>$val) {

$param = array();
$param[1] = trim($val["date_received"]);
$param[2] = trim($val["RouteCode"]);
$param[3] = trim($val["ItemCode"]);
$param[4] = trim($val["Issued_qty"]);
$param[5] = trim($val["ERPReferenceNumber"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_startload(?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_whglmatrixAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_whglmatrix = $data["rp_whglmatrix"]; 

foreach($rp_whglmatrix as $key=>$val) {

$param = array();
$param[1] = trim($val["RouteCode"]);
$param[2] = trim($val["ItemCode"]);
$param[3] = trim($val["sales_account"]);
$param[4] = trim($val["cost_of_sales_acc"]);
$param[5] = trim($val["stock_account"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_whglmatrix(?,?,?,?,?)',$param,'');
}
exit;
}
public function rp_whstockAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$rp_whstock = $data["rp_whstock"]; 

foreach($rp_whstock as $key=>$val) {

$param = array();
$param[1] = trim($val["warehouse"]);
$param[2] = trim($val["product"]);
$param[3] = trim($val["physical_qty"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_rp_whstock(?,?,?)',$param,'');
}
exit;
}
public function t_UserMasterAction()
{
$data = json_decode(file_get_contents('php://input'), true);
$t_UserMaster = $data["t_UserMaster"]; 

foreach($t_UserMaster as $key=>$val) {

$param = array();
$param[1] = trim($val["UserName"]);
$param[2] = trim($val["Password"]);
$resultdata = $this->SFA_Comman->executequery('CALL sp_ws_import_getdata_from_t_UserMaster(?,?)',$param,'');
}
exit;
}