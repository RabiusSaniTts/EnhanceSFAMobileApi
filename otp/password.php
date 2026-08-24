<?php
error_reporting(1);
  
session_start();  
  
if(!$_SESSION['email'])  
{  
  
    header("Location: index.php");//redirect to login page to secure the welcome page without login access.  
}  
  

function tonewpass($newkey)
{
		//$str ='049574563';
		$new=''	;
		$narr=array();
		$chars = chunk_split($newkey, 2, ',');
		
		$char = explode(',',$chars);
		$key=array_filter($char);
		
		for($i=0;$i<count($key);$i++)
		{
			//echo $key[$i]."<br>";
			$new =100 - $key[$i];
			array_push($narr,$new);
				
		}
		$str=implode($narr,'');	
// echo 'strt' . $str . ',';			
		$rstr=strrev($str);

		return toAlpha($rstr);
}   
function toAlpha($data){
       
        $numlen = (int)strlen($data);        
        if($numlen <8) {            
          //  $data = (int)($data.'123');
		  $data = $data.'123';
        }
    //  echo $data."<<>>>";   
        $alphabet =   array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
		//$alphabet =   array('0','1','2','3','4','5','6','7','8','9');
		
        $alpha_flip = array_flip($alphabet);
        if($data <= 25){
			
          return toNumber($alphabet[$data]);
        }
        elseif($data > 25){
          $dividend = ($data + 1);		  
          $alpha = '';
          $modulo;
          while ($dividend > 0)
		  {
            // $modulo = ($dividend - 1) % 26;	//org line sujee commented 
			$modulo = fmod(($dividend - 1), 26);			
             $alpha = $alphabet[$modulo] . $alpha;		
             $dividend = floor((($dividend - $modulo) / 26));
          } 
		 // echo $alpha;
          return toNumber($alpha);
        }    
    }
	
	function toNumber($data1)
	{
		$str = $data1; 
		$out = '';
		$pos = '';
			for($i = 0;$i<strlen($str);$i++) 
			{
    
				switch($str[$i]) 
				{
					case '0': $pos .="0";break;
					case '1': $pos .="1";break;
					case '2': $pos .="2";break;
					case '3': $pos .="3";break;
					case '4': $pos .="4";break;
					case '5': $pos .="5";break;
					case '6': $pos .="6";break;
					case '7': $pos .="7";break;
					case '8': $pos .="8";break;
					case '9': $pos .="9";break;
					case '-': $pos .="-";break;
					case  'a': case 'b': case 'c': $pos .="2";break;
					case  'd': case 'e': case 'f': $pos .="3";break;
					case  'g': case 'h': case 'i': $pos .="4";break;
					case  'j': case 'k': case 'l': $pos .="5";break;
					case  'm': case 'n': case 'o': $pos .="6";break;
					case  'p': case 'q': case 'r': case 's': $pos .="7";break;
					case  't': case 'u': case 'v': $pos .="8";break;
					case  'w': case 'x': case 'y': case 'z': $pos .="9";break;
				}
			}
	return $pos;
	}
?>
	<html>
<head>

<title>RoutePro OTP</title>	
<style>
#container {
  width: 100%;
  margin: 10px auto; /* centers it */
  padding: 0;
}

#right {
  float: right;
}

#center {
  float: center;
}

#bottom {
  clear: both;
  padding: 10px 2%;
  margin: 0;
}

.body_bg{
	background: #d1d1d1;
	background-repeat:repeat-x;
	font-family: Verdana,sans-serif;
	font-size: 70%;
}

table,tr,td {
	border: 1px solid #000;
}

.heading {
	font-weight : bold;
	text-decoration : UnderLine;
}

.errorInfo {
	font-weight : bold;
	color : red;
}

.label {
    width: 30%;
    display: inline-block;
}

table, th, td {
    border: 0.5px  black;
}

table {
    width: 80%;
}

td {
    height: 20px;
    vertical-align: meddle;
	
}
 .textbox { 
    -webkit-border-radius: 5px; 
    -moz-border-radius: 5px; 
    border-radius: 5px; 
    border: 1px solid #848484; 
    outline:0; 
    height:45px; 
    width: 275px; 
 } 
 
.hd {
	background-color: #f2f2f2;
	font-size: 70%;
}
	
</style>
<script text="Javascript">

function validation()
{
	var d = new Date();	
	var d1= d.getMonth()+1;
	var d2= d.getDate();
	var d3= d.getHours();
	var d4= d.getMinutes();
	var d5= d.getSeconds();
	//var d6= d2.concat(d1,d3,d4,d5);
	alert(d1);
	alert(d2);
	alert(d3);
	alert(d4);
	
	if(document.getElementById('pass').value=="")
	{
		alert("Please Enter Access Key");
		return false;
	}
	else		
	{
		return true;
	}
}
function hidecustomer(val){
//alert(val.selectedIndex);
	if(val.selectedIndex == 7){
		document.getElementById('customer').style.display ="none";
		document.getElementById("customercode").removeAttribute('required');
	}else {
//	alert(document.getElementById('customer'));
		document.getElementById('customer').style.display ="";
		//document.getElementById("customercode").setAttribute('required');
	}
}

function hideothers(val)
{
	if(val.selectedIndex == 5)
	{		
		document.getElementById('otherreason').style.display ="block";
	}
	else
	{		
		document.getElementById('otherreason').style.display ="none";
	}
}

</script>

 </head>
<body class="body_bg" src="bg.png" >
<h3 align="left">User: <?=$_SESSION['email']; ?> | <a href="logout.php">Logout</a></h3><h2 align="center"><img alt="RoutePro" src="route_logo.png"></h2>

<div id="container" >
<form action="" method="POST" align="center">
<div></div>
	
	<table  align="center" style="border-style: dotted solid dashed double;">
	
		<tr>
			<td align="right">Override For :-</td>
			<td>
				<select name="type" id="type" align="right" onChange="hidecustomer(this);">
					<!--<option value='-1' >------------ Select -------------</option> -->
					<option value='2' <?php if($_POST['type'] == "2") {echo "selected"; }  ?>>GPS IN</option>
					<!-- <option value='1' <?php if($_POST['type'] == "1") {echo "selected"; }  ?>>Journey Plan </option> -->
					
					<!--<option value='3' <?php if($_POST['type'] == "3") {echo "selected"; }  ?>>Post Void </option>
					<option value='4' <?php if($_POST['type'] == "4") {echo "selected"; }  ?>>Customer Returns </option>
					<?php if($_SESSION['usertypeid'] < '6') {?>
					<!--<option value='5' <?php if($_POST['type'] == "5") {echo "selected"; }  ?>>Credit Limit Amount </option>
					<option value='6' <?php if($_POST['type'] == "6") {echo "selected"; }  ?>>Credit Days </option> -->
					<?php } ?>
					<!--<option value='7' <?php if($_POST['type'] == "7") {echo "selected"; }  ?>>Multiple Request </option> -->
					
				</select>
			</td>
		</tr>
		<?php if($_POST['type'] <> "7") 
		{
		?>
			<tr id="customer">
				<td align="right">CustomerCode :-</td>
				<td>
					<input align="right" type="text" value="<?php echo $_POST['customercode'];?>" name="customercode" id="customercode" required>
				</td>
			</tr>
		<?php 
		}
		?>
		<tr>
			<td align="right">OPT Reason</td>
			<td>
				<select name="otpreason" id ="otpreason" onChange="hideothers(this)">
					<option>Select</option>
					<option>Master is Wrong</option>
					<option>Payment</option>
					<option>GRV</option>
					<option>Order From HO</option>
					<option>Others</option>
				</select>
			</td>
			
		</tr>
		<tr>
			<td align="right">Other Reason</td>
			<td>
				<input type="text" name="otherreason" id="otherreason" style="display:none">
			</td>
		</tr>
	<!--	<tr>
			<td align="right">Comments :- </td>
			<td>
				
				<textarea name="comments" id="comments" ><?php echo $_POST['comments'];?></textarea>
			</td>
		</tr> -->
		<tr>
			<td align="right">Access Key :- </td><td><input align="right" type="text" value="<?php echo $_POST['pass'];?>" name="pass" id="pass" required></td>
		</tr>
		<tr>
			<td colspan="2" align="center"><input  type="submit" value="GetData" name="submit"/></td>
		</tr>
	</table>
	
	
	
</form>
 </div>




<div id="pwd">
<?php
include("config.php"); 
include("db_conection.php");  
//print_r($_POST);exit;
if($_POST['submit'])
{
	
			//echo $otpreason; 
			//echo $_POST['otherreason']; exit;
	if($_POST['pass'] != '')
	{		
		if($_POST['type']!='-1')
		{
			
			if(1) //$otpreason != 'Select' $$ $otpreason !=''
			{
				if($_POST['type'] == '1' || $_POST['type'] == '2'||$_POST['type'] == '3'||$_POST['type'] == '4' || $_POST['type'] == '7')
				{
				$heading = '<p class="heading" align="center">The New Password is  :- <font color="red">' .toAlpha($_POST['pass']) .'</font></p>';	
				}elseif($_POST['type'] =='5' || $_POST['type'] == '6')
				{
				$heading = '<p class="heading" align="center">The New Password is  :- <font color="red">' .tonewpass($_POST['pass']) .'</font></p>';
				}
				
				$customercode = $_POST['customercode'];
				$comments = '';//$_POST['comments'];
				
				$otpreason = $_POST['otpreason'];
				if($_POST['otpreason'] == 'Others')
				{
					$otpreason = $_POST['otherreason'];
				}

				

				if($customercode != '') 
				{	
					if($otpreason != '' && $otpreason != 'Select')	
					{	
						$retVal = getCustomerMasterData($customercode,$dbcon);
						// echo "--";exit;
						if(!$_SESSION['email'] )  
						{  
						  
							header("Location: index.php");//redirect to login page to secure the welcome page without login access.  
						}
						else if($retVal == TRUE)
						{
							echo $heading;
							updateotpgenerationdetails($customercode,$_SESSION['email'],$_POST['type'],$dbcon,$otpreason,$comments);
						}
				
				
						if($retVal == TRUE)
						{					
							//getInvoiceData($customercode,$dbcon);		// Commented by Rabius as per request Sandeep 4/2/2026			
						}
					}
					else
					{
						echo '<p class="errorInfo">Please enter OTP Reason</p>';	
					}
				} 
				else if($_POST['type'] <> '7' || $_POST['type'] <> '2') 
				{
					echo '<p class="errorInfo">Please enter CustomerCode and OTP Reason</p>';	
				}
			}
			else
			{
				$heading = '<p class="errorInfo">Please select OTP reason.</p>';	
			}
		}
		else
		{
			$heading = '<p class="errorInfo">Please select a reason.</p>';	
			echo $heading;exit;
		}
	
	
		
	} 
	else 
	{
		$heading = '<p class="errorInfo">Please enter Access Key</p>';	
		echo $heading;exit;		
	}	
	 
}


function getCustomerMasterData($customercode,$dbcon) {
	$retVal = TRUE;
	$uname = $_SESSION['email'];
	//$check_user="select customercode,customername,ROUND(creditlimit,2),creditlimitdays,graceperiod from customermaster WHERE alternatecode = '$customercode'";
	
	$check_customer_available = "SELECT 
					cm.alternatecode,
					cm.customeraddress1, 
					cm.customername
				FROM customermaster cm
				INNER JOIN company cmp 
					ON cmp.name = cm.DivisionCode 
				INNER JOIN useraccesscodes u 
					ON u.cmpycode = cmp.cmpycode  
				WHERE cm.alternatecode = '$customercode'
				  AND u.username = '$uname'  ";
	
	$check_customer = mysqli_query($dbcon,$check_customer_available); 
	
	if(mysqli_num_rows($check_customer))  {
		
		$check_user_back = "
                SELECT 
					cm.alternatecode,
					cm.customeraddress1, 
					cm.customername,
					COUNT(old.customercode) AS otp_count_last_60_days
				FROM customermaster cm
				INNER JOIN company cmp 
					ON cmp.name = cm.DivisionCode 
				INNER JOIN useraccesscodes u 
					ON u.cmpycode = cmp.cmpycode 
				LEFT JOIN otplogdetail old 
					ON cm.customercode = old.customercode
				WHERE cm.alternatecode = '$customercode'
				  AND u.username = '$uname'
				  AND old.otpdate >= DATE_SUB(NOW(), INTERVAL 60 DAY)
				GROUP BY 
					cm.alternatecode ";
					
		$check_user = "
			SELECT 
				cm.alternatecode,
				cm.customeraddress1, 
				cm.customername,
				COUNT(old.customercode) AS otp_count_last_60_days
			FROM customermaster cm
			INNER JOIN company cmp 
				ON cmp.name = cm.DivisionCode 
			INNER JOIN useraccesscodes u 
				ON u.cmpycode = cmp.cmpycode 
			LEFT JOIN otplogdetail old 
				ON cm.customercode = old.customercode
			   AND old.otpdate >= DATE_SUB(NOW(), INTERVAL 60 DAY)
			WHERE cm.alternatecode = '$customercode'
			  AND u.username = '$uname'
			GROUP BY 
				cm.alternatecode,
				cm.customeraddress1,
				cm.customername
		";
					
	
		$run=mysqli_query($dbcon,$check_user);    
		
		$headerColumn = array("Customer Code","Customer Outlet","CustomerName","Last 60 days OTP provided count");
		$headerColumCount = sizeof($headerColumn);
		
		$heading = '<p class="heading" align="center">Customer Information of CustomerCode : ' .$customercode .'</p>';
		$tableStart =  '<table align="center"><tbody>';
		$tableEnd = '</tbody></table>';
		$headerRow = '<tr id = "HeaderRow" class="hd">';
		$rowEnd	= '</tr>';
		for($i = 0; $i < $headerColumCount; $i++){
			$headerRow = $headerRow .'<td>' .$headerColumn[$i] .'</td>';
		}
		$headerRow = $headerRow . $rowEnd;
		$customerDetail = "";
		while ($row = mysqli_fetch_array($run))
		{
			$detailRow = '<tr id = "HeaderDetail">';
			for($i = 0; $i < $headerColumCount; $i++){
				$detailRow = $detailRow .'<td>' .$row[$i] .'</td>';	
			}
			$customerDetail = $customerDetail .$detailRow . $rowEnd;
		}
		echo $heading .$tableStart .$headerRow .$customerDetail .$tableEnd;
		return TRUE;
		 
		
	}else{
		$heading = '<p class="errorInfo">No Information of Customer / Invalid Customer : ' .$customercode .'</p>';
		echo $heading;
		return FALSE;
	}
	
		
}

function getCustomerMasterData_bk_4_2_26_raju($customercode,$dbcon) {
	$retVal = TRUE;
	$uname = $_SESSION['email'];
	//$check_user="select customercode,customername,ROUND(creditlimit,2),creditlimitdays,graceperiod from customermaster WHERE alternatecode = '$customercode'";
	
	$check_user = "
                SELECT 
					cm.alternatecode,
					cm.customeraddress1, 
					cm.customername,
					COUNT(old.customercode) AS otp_count_last_60_days
				FROM customermaster cm
				INNER JOIN company cmp 
					ON cmp.name = cm.DivisionCode 
				INNER JOIN useraccesscodes u 
					ON u.cmpycode = cmp.cmpycode 
				INNER JOIN otplogdetail old 
					ON cm.customercode = old.customercode
				WHERE cm.alternatecode = '$customercode'
				  AND u.username = '$uname'
				  AND old.otpdate >= DATE_SUB(NOW(), INTERVAL 60 DAY)
				GROUP BY 
					cm.alternatecode ";
					
	
    $run=mysqli_query($dbcon,$check_user);    
    if(mysqli_num_rows($run))  {
	
		$headerColumn = array("Customer Code","Customer Outlet","CustomerName","Last 60 days OTP provided count");
		$headerColumCount = sizeof($headerColumn);
		
		$heading = '<p class="heading" align="center">Customer Information of CustomerCode : ' .$customercode .'</p>';
		$tableStart =  '<table align="center"><tbody>';
		$tableEnd = '</tbody></table>';
		$headerRow = '<tr id = "HeaderRow" class="hd">';
		$rowEnd	= '</tr>';
		for($i = 0; $i < $headerColumCount; $i++){
			$headerRow = $headerRow .'<td>' .$headerColumn[$i] .'</td>';
		}
		$headerRow = $headerRow . $rowEnd;
		$customerDetail = "";
		while ($row = mysqli_fetch_array($run))
		{
			$detailRow = '<tr id = "HeaderDetail">';
			for($i = 0; $i < $headerColumCount; $i++){
				$detailRow = $detailRow .'<td>' .$row[$i] .'</td>';	
			}
			$customerDetail = $customerDetail .$detailRow . $rowEnd;
		}
		echo $heading .$tableStart .$headerRow .$customerDetail .$tableEnd;
		return TRUE;
	} else {
		//$heading = '<p class="errorInfo">No Information of Customer / Invalid Customer : ' .$customercode .'</p>';
		//echo $heading;
		return TRUE;
	}	
}
function updateotpgenerationdetails($customercode,$username,$type,$dbcon,$comments,$otpreason){
	$typearr = array("Journey Plan","GPS IN","Post Void","Customer Returns","Credit Limit Amount","Credit Days","Multiple Request");

	$sel_user="select cm.routecode,cm.customercode from customermaster cm  inner join routesequence rs ON rs.customercode= cm.customercode where cm.alternatecode  = '$customercode'";
    //echo $sel_user;exit;
	$run=mysqli_query($dbcon,$sel_user);  
    if(mysqli_num_rows($run))  {
		while ($row = mysqli_fetch_array($run))
		{
		   $routecode 		= $row["routecode"];
		   $customercode 	= $row["customercode"];
		   
		}
	}
	 $updatecustomer ="insert into otplogdetail (routecode,customercode,username,otptype,otpdate,otptime,cdate,comments,otpreason) VALUES ($routecode,$customercode,'".$username."','".$typearr[$type-1]."','".date("Y-m-d")."',CURRENT_TIME(), NOW(),'".$comments."', '".$otpreason."')";
	//echo  $updatecustomer;exit;
	mysqli_query($dbcon,$updatecustomer); 
}
function getInvoiceData($customercode,$dbcon) {
	$check_user=	"SELECT  cs.transactiondate,cs.invoicenumber,cs.erpreferencenumber,sm.`alternatesalesmancode`, 
					ROUND(cs.totalinvoiceamount,2),ROUND(cs.invoicebalance,2) ,cs.duedate 
					FROM customerinvoice cs
					INNER JOIN salesman sm ON sm.salesmancode = cs.salesmancode
					INNER JOIN customermaster cm on cm.customercode = cs.customercode
					WHERE cm.alternatecode = '$customercode' 
					ORDER BY duedate";
				
    $run=mysqli_query($dbcon,$check_user);    
    if(mysqli_num_rows($run))  {
	
		$headerColumn = array("TransactionDate","InvoiceNumber","ERPReferenceNumber","SalesmanCode","TotalInvoiceAmount","InvoiceBalance","DueDate");
		$headerColumCount = sizeof($headerColumn);
		
		$heading = '<p class="heading" align="center">Invoice Information of CustomerCode : ' .$customercode .'</p>';
		$tableStart =  '<div style="overflow-y:auto;"><table align="center"><tbody>';
		$tableEnd = '</tbody></table ></div>';
		$headerRow = '<tr id = "DetailHeaderRow" class="hd">';
		$rowEnd	= '</tr>';
		for($i = 0; $i < $headerColumCount; $i++){
			$headerRow = $headerRow .'<td>' .$headerColumn[$i] .'</td>';
		}
		$headerRow = $headerRow . $rowEnd;
		$invoiceDetail = "";
		$count = 0;		
		while ($row = mysqli_fetch_array($run))
		{			
			$detailRow = '<tr id = "DetailRow' .$count .'">';
			for($i = 0; $i < $headerColumCount; $i++){
				$detailRow = $detailRow .'<td>' .$row[$i] .'</td>';	
			}
			$invoiceDetail = $invoiceDetail. $detailRow . $rowEnd;
			$count++;
		}
		echo $heading .$tableStart .$headerRow .$invoiceDetail .$tableEnd;
	} else {
		$heading = '<p class="errorInfo">No Invoice Information of CustomerCode : ' .$customercode .'</p>';
		echo $heading;
	}
}
?>
</div>
</div></body>
</html>
