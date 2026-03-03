# ─────────────────────────────────────────────────────────────────────────────
# AssetIQ Jenkins Agent — python-agent
#
# Responsibilities:
#   - Python linting (flake8)
#   - pytest test suite
#   - IP audit (audit_client_repo.py)
#   - SDK validation (Python + TypeScript static checks)
#
# Does NOT contain: Docker CLI, Terraform, Node.js, AWS CLI
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

LABEL maintainer="assetiq-ops"
LABEL agent.type="python"
LABEL agent.version="1.0"

# ── System dependencies ───────────────────────────────────────────────────────
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
    git \
    curl \
    ca-certificates \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# ── Jenkins agent runtime ─────────────────────────────────────────────────────
# Jenkins controller communicates with agents via JNLP (port 50000).
# agent.jar is the standard Jenkins remoting jar.
ARG JENKINS_AGENT_VERSION=3261.v9c670a_4748a_9
RUN curl -sLo /usr/local/bin/agent.jar \
    https://repo.jenkins-ci.org/releases/org/jenkins-ci/main/remoting/${JENKINS_AGENT_VERSION}/remoting-${JENKINS_AGENT_VERSION}.jar \
    && chmod 644 /usr/local/bin/agent.jar

# ── Jenkins user ──────────────────────────────────────────────────────────────
RUN groupadd -g 1000 jenkins && useradd -u 1000 -g 1000 -m -s /bin/bash jenkins
WORKDIR /home/jenkins
USER jenkins

# ── Python tooling ────────────────────────────────────────────────────────────
# Pre-install all packages the pipeline needs so stages don't waste time on pip.
# requirements.txt from the repo is installed at pipeline runtime (not here)
# because it changes with the codebase.
RUN pip install --upgrade pip

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        # Test framework
        pytest==8.2.0 \
        pytest-asyncio==0.23.7 \
        pytest-cov==5.0.0 \
        # Linting
        flake8==7.0.0 \
        # HTTP client for API tests
        httpx==0.27.0 \
        requests==2.32.3 \
        # Core deps that requirements.txt will also install — cached here
        fastapi==0.111.0 \
        pydantic==2.7.1 \
        numpy==1.26.4 \
        scipy==1.13.0 \
        boto3==1.34.120

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/home/jenkins/.local/bin:${PATH}"

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
USER root
RUN chmod +x /usr/local/bin/entrypoint.sh
USER jenkins

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
