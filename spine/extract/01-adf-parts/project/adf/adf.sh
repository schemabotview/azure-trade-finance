#!/usr/bin/env bash
# Data Factory from the terminal, through Resource Manager's REST API.
#   adf/adf.sh get <path> [az args]         read a part: linkedservices, ...
#   adf/adf.sh status <runtime>             a runtime's state, node, version
#   adf/adf.sh online <runtime>             wait (5 minutes at most) for Online
#   adf/adf.sh run <pipeline> [name=value]  start a run: its id
#   adf/adf.sh wait <run>                   until the run ends: its status
#   adf/adf.sh activities <run>             each activity and its result
#   adf/adf.sh rerun <run>                  again, from the failed activity
#   adf/adf.sh last <pipeline>              the pipeline's latest run
#   adf/adf.sh input <run> <activity>       what an activity was given
set -euo pipefail
F="https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups"
F="$F/rg-tradefin-dev/providers/Microsoft.DataFactory"
F="$F/factories/adf-tradefin-dev"
V="api-version=2018-06-01"
ANY='{"lastUpdatedAfter":"2000-01-01T00:00:00Z",'
ANY+='"lastUpdatedBefore":"2100-01-01T00:00:00Z"}'
case "$1" in
get)
  path=$2; shift 2
  az rest --url "$F/$path?$V" "$@" ;;
status)
  az rest -m post --url "$F/integrationRuntimes/$2/getStatus?$V" -o tsv \
    --query "properties.[state, typeProperties.nodes[0].nodeName,
             typeProperties.version]" ;;
online)
  for _ in $(seq 30); do
    "$0" status "$2" | grep -q '^Online' && break
    sleep 10
  done
  "$0" status "$2" ;;
run)
  pipeline=$2; shift 2
  body=$(python3 -c 'import json, sys
print(json.dumps(dict(a.split("=", 1) for a in sys.argv[1:])))' "$@")
  az rest -m post --url "$F/pipelines/$pipeline/createRun?$V" \
    --body "$body" --query runId -o tsv ;;
wait)
  for _ in $(seq 90); do
    status=$(az rest --url "$F/pipelineruns/$2?$V" --query status -o tsv \
      2>/dev/null) || status=Unknown # a dropped connection: ask again
    case $status in Queued | InProgress | Canceling | Unknown) sleep 10 ;;
    *) break ;; esac
  done
  echo "$status" ;;
activities)
  az rest -m post --url "$F/pipelineruns/$2/queryActivityruns?$V" \
    --body "$ANY" -o tsv --query "sort_by(value, &activityRunStart)[].[
      activityName, status,
      output.rowsCopied || output.firstRow && to_string(output.firstRow)
      || error.message || '']" ;;
rerun)
  pipeline=$(az rest --url "$F/pipelineruns/$2?$V" --query pipelineName -o tsv)
  again="referencePipelineRunId=$2&isRecovery=true&startFromFailure=true"
  az rest -m post --url "$F/pipelines/$pipeline/createRun?$V&$again" \
    --query runId -o tsv ;;
last)
  az rest -m post --url "$F/queryPipelineRuns?$V" --body "$ANY" -o tsv \
    --query "max_by(value[?pipelineName=='$2'], &runStart).runId" ;;
input)
  az rest -m post --url "$F/pipelineruns/$2/queryActivityruns?$V" \
    --body "$ANY" --query "value[?activityName=='$3'] | [0].input" ;;
esac
