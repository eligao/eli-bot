#!/bin/bash
# remember to set .env!
yarn global add nodemon
rm -r data/*.dat data/*.mmdb
wget \
    --header="$IPIP_DB_AUTH_HEAD" \
    -O data/17monipdb.dat \
    $IPIP_DB_DL_URL
mkdir data_tmp
cd data_tmp
wget $MMDB_CITY_URL
tar -zxf *.tar.gz
cd ..
mv data_tmp/*/*.mmdb data/
rm -rf ./data_tmp