#!/bin/bash
set -x

# TODO: Update stream names
STREAMS=('update-me-stream-name-1', 'update-me-stream-name-2')

for stream in "${STREAMS[@]}"; do
  awslocal firehose create-delivery-stream --delivery-stream-name "${stream}"
done
set +x
