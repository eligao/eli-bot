#!/bin/bash
# remember to set .env!
rm -rv data/*.dat data/*.datx data/*.mmdb
wget \
    --header="$IPIP_DB_AUTH_HEAD" \
    -O data/17monipdb.datx \
    $IPIP_DB_DL_URL
mkdir data_tmp
cd data_tmp
wget $MMDB_CITY_URL
wget $MMDB_ASN_URL
tar -zxf *.tar.gz
cd ..
mv -v data_tmp/*/*.mmdb data/
rm -rfv ./data_tmp