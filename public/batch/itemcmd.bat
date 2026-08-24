cd "C:\wamp\bin\mysql\mysql5.6.17\bin"
mysql --execute "delete from sfa_enhance.rp_item;" --user=root
mysql --execute "LOAD DATA LOCAL INFILE 'C:\\wamp\\www\\sfa\\enhance\\log\\item.csv' INTO TABLE sfa_enhance.rp_item FIELDS TERMINATED BY ',' LINES TERMINATED BY '\r\n';" --user=root


