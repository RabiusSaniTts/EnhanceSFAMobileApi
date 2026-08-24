cd "C:\wamp\bin\mysql\mysql5.6.17\bin"
mysql --execute "delete from sfa_enhance.rp_glmatrix;" --user=root
mysql --execute "LOAD DATA LOCAL INFILE 'C:\\wamp\\www\\sfa\\enhance\\log\\glmatrix.csv' INTO TABLE sfa_enhance.rp_glmatrix FIELDS TERMINATED BY ',' LINES TERMINATED BY '\r\n';" --user=root


