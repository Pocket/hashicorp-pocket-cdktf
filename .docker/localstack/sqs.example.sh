#!/bin/bash
set -x

# TODO: Update queue name
SQS=('update-me-queue-name-1', 'update-me-queue-name-2')

for sqs_queue in "${SQS[@]}"; do
  awslocal sqs create-queue --queue-name "${sqs_queue}"
done

set +x
