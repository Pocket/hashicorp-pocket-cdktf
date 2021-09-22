#!/bin/bash
set -x

# TOOD: Update stream names
STREAMS=('update-me-stream-name-1', 'update-me-stream-name-2')

for stream in "${STREAMS[@]}"; do
  awslocal kinesis create-stream --stream-name "${stream}" --shard-count 3
done
set +x
