#!/bin/bash
set -e

# DATABSE_URL is needed for dbmate to execute the migration
export DATABASE_URL=postgres://$BACKEND_STORAGE_USER:$BACKEND_STORAGE_PASS@$BACKEND_STORAGE_HOST:$BACKEND_STORAGE_PORT/$BACKEND_STORAGE_NAME
/dbmate -d /migrations migrate 
/dbmate -d /migrations status 

if [ -f "/ca/batch_ca.crt" ]; then
  ln -s /ca/batch_ca.crt /usr/local/share/ca-certificates/batch_ca.crt
  update-ca-certificates
fi

/go-template-linux -d
