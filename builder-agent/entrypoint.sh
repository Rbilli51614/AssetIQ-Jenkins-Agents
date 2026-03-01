#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Jenkins Agent Entrypoint
#
# Connects this container to the Jenkins controller via JNLP.
# All three agents (python, builder, infra) use this same script.
#
# Required environment variables (set in docker-compose.yml):
#   JENKINS_URL        — e.g. http://jenkins:8080
#   JENKINS_AGENT_NAME — e.g. python-agent-1
#   JENKINS_SECRET     — JNLP secret from Jenkins UI
#   JENKINS_WEB_SOCKET — set to "true" to use WebSocket (recommended)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

: "${JENKINS_URL:?JENKINS_URL must be set}"
: "${JENKINS_AGENT_NAME:?JENKINS_AGENT_NAME must be set}"
: "${JENKINS_SECRET:?JENKINS_SECRET must be set}"

echo "Starting Jenkins agent: ${JENKINS_AGENT_NAME}"
echo "Connecting to: ${JENKINS_URL}"

# Build the argument list
ARGS=(
    -jar /usr/local/bin/agent.jar
    -url "${JENKINS_URL}"
    -name "${JENKINS_AGENT_NAME}"
    -secret "${JENKINS_SECRET}"
    -workDir /home/jenkins/workspace
)

# WebSocket mode avoids needing to expose port 50000 on the controller
if [ "${JENKINS_WEB_SOCKET:-false}" = "true" ]; then
    ARGS+=(-webSocket)
fi

mkdir -p /home/jenkins/workspace

exec java -jar /usr/local/bin/agent.jar \
    -url "${JENKINS_URL}" \
    -name "${JENKINS_AGENT_NAME}" \
    -secret "${JENKINS_SECRET}" \
    -workDir /home/jenkins/workspace \
    ${JENKINS_WEB_SOCKET:+-webSocket}
