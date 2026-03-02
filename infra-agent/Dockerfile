# ─────────────────────────────────────────────────────────────────────────────
# AssetIQ Jenkins Agent — infra-agent
#
# Responsibilities:
#   - Terraform init / plan / apply (proprietary + client stacks)
#   - AWS CLI — ECS force-deploy, SageMaker endpoint update, S3 sync
#   - CloudFront invalidation
#   - Smoke tests (curl health checks)
#
# Does NOT contain: Docker daemon, Node.js, pytest
# ─────────────────────────────────────────────────────────────────────────────
FROM ubuntu:22.04

LABEL maintainer="assetiq-ops"
LABEL agent.type="infra"
LABEL agent.version="1.0"

ENV DEBIAN_FRONTEND=noninteractive
ENV TERRAFORM_VERSION=1.6.6
ENV TF_IN_AUTOMATION=1
ENV TF_INPUT=0
ENV TF_CLI_ARGS_plan="-compact-warnings"

# ── System dependencies ───────────────────────────────────────────────────────
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
    git \
    curl \
    ca-certificates \
    unzip \
    jq \
    openssh-client \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# ── Terraform ─────────────────────────────────────────────────────────────────
RUN curl -sLo /tmp/terraform.zip \
    "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" && \
    unzip -q /tmp/terraform.zip -d /usr/local/bin && \
    rm /tmp/terraform.zip && \
    terraform version

# ── AWS CLI v2 ────────────────────────────────────────────────────────────────
RUN curl -sL "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o /tmp/awscliv2.zip && \
    unzip -q /tmp/awscliv2.zip -d /tmp && \
    /tmp/aws/install && \
    rm -rf /tmp/awscliv2.zip /tmp/aws && \
    aws --version

# ── Jenkins agent runtime ─────────────────────────────────────────────────────
ARG JENKINS_AGENT_VERSION=3261.v9c670a_4748a_9
RUN curl -sLo /usr/local/bin/agent.jar \
    https://repo.jenkins-ci.org/releases/org/jenkins-ci/main/remoting/${JENKINS_AGENT_VERSION}/remoting-${JENKINS_AGENT_VERSION}.jar \
    && chmod 644 /usr/local/bin/agent.jar

# ── Jenkins user ──────────────────────────────────────────────────────────────
RUN groupadd -g 1000 jenkins && \
    useradd -u 1000 -g 1000 -m -s /bin/bash jenkins

# ── Python tooling ────────────────────────────────────────────────────────────
# boto3 for SageMaker endpoint update script
RUN pip3 install --no-cache-dir --break-system-packages \
    boto3==1.34.120 \
    sagemaker==2.221.0

# ── Terraform plugin cache ────────────────────────────────────────────────────
# Pre-warm the Terraform plugin cache for AWS + random providers.
# Agents share a mounted volume at this path so providers download once.
RUN mkdir -p /home/jenkins/.terraform.d/plugin-cache
ENV TF_PLUGIN_CACHE_DIR=/home/jenkins/.terraform.d/plugin-cache

WORKDIR /home/jenkins
RUN chown -R jenkins:jenkins /home/jenkins

USER jenkins

ENV PATH="/home/jenkins/.local/bin:${PATH}"
ENV PYTHONUNBUFFERED=1

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
USER root
RUN chmod +x /usr/local/bin/entrypoint.sh
USER jenkins

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
