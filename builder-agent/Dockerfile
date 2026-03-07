# ─────────────────────────────────────────────────────────────────────────────
# AssetIQ Jenkins Agent — builder-agent
#
# Responsibilities:
#   - Docker image builds (gateway, training, client-api)
#   - ECR authentication and image push
#   - npm install + Vite production build (React dashboard)
#
# Does NOT contain: Terraform, Python test tools
# ─────────────────────────────────────────────────────────────────────────────
FROM --platform=linux/amd64 ubuntu:22.04

LABEL maintainer="assetiq-ops"
LABEL agent.type="builder"
LABEL agent.version="1.0"

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20
ENV DOCKER_BUILDKIT=1

# ── System dependencies ───────────────────────────────────────────────────────
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
    git \
    curl \
    ca-certificates \
    unzip \
    gnupg \
    lsb-release \
    openssh-client \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# ── Docker CLI ────────────────────────────────────────────────────────────────
# Install Docker CLI only (not the daemon — the host daemon is used via socket).
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list && \
    apt-get update -qq && \
    apt-get install -y -qq docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# ── AWS CLI v2 ────────────────────────────────────────────────────────────────
RUN curl -sL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip && \
    unzip -q /tmp/awscliv2.zip -d /tmp && \
    /tmp/aws/install && \
    rm -rf /tmp/awscliv2.zip /tmp/aws

# ── Node.js ───────────────────────────────────────────────────────────────────
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y -qq nodejs && \
    npm install -g npm@latest && \
    node --version && npm --version

# ── Jenkins agent runtime ─────────────────────────────────────────────────────
ARG JENKINS_AGENT_VERSION=3261.v9c670a_4748a_9
RUN curl -sLo /usr/local/bin/agent.jar \
    https://repo.jenkins-ci.org/releases/org/jenkins-ci/main/remoting/${JENKINS_AGENT_VERSION}/remoting-${JENKINS_AGENT_VERSION}.jar \
    && chmod 644 /usr/local/bin/agent.jar

# ── Jenkins user ──────────────────────────────────────────────────────────────
# Must be in the docker group to access the host Docker socket.
RUN groupadd -g 1000 jenkins && \
    useradd -u 1000 -g 1000 -m -s /bin/bash jenkins && \
    usermod -aG docker jenkins

WORKDIR /home/jenkins
USER jenkins

# ── npm cache ─────────────────────────────────────────────────────────────────
# Pre-warm npm cache for common dashboard dependencies to speed up npm ci.
RUN npm config set cache /home/jenkins/.npm-cache

# ── Python tooling ────────────────────────────────────────────────────────────
# Minimal Python needed for awscli helpers in the pipeline.
RUN pip3 install --no-cache-dir --break-system-packages \
    awscli \
    boto3==1.34.120

ENV PATH="/home/jenkins/.local/bin:${PATH}"
ENV PYTHONUNBUFFERED=1

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
USER root
RUN chmod +x /usr/local/bin/entrypoint.sh
USER jenkins

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]