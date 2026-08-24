cd "C:\wamp\bin\mysql\mysql5.6.17\bin"
mysql --execute "delete from sfa_enhance.rp_sman;" --user=root
mysql --execute "LOAD DATA LOCAL INFILE 'C:\\wamp\\www\\sfa\\enhance\\log\\sman.csv' INTO TABLE sfa_enhance.rp_sman FIELDS TERMINATED BY ',' LINES TERMINATED BY '\r\n';" --user=root


