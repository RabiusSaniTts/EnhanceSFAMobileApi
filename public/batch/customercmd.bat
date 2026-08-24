cd "C:\wamp\bin\mysql\mysql5.6.17\bin"
mysql --execute "delete from sfa_enhance.rp_customer;" --user=root
mysql --execute "LOAD DATA LOCAL INFILE 'C:\\wamp\\www\\sfa\\enhance\\log\\customer.csv' INTO TABLE sfa_enhance.rp_customer FIELDS TERMINATED BY ',' LINES TERMINATED BY '\r\n';" --user=root
mysql --user=root sfa_enhance < C:\wamp\www\sfa\enhance\public\batch\script.sql


