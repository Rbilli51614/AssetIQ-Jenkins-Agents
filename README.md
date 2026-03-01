# AssetIQ Jenkins Agents

Three specialised Docker agents that run alongside the Jenkins controller.
Each agent has only what it needs — nothing more.

```
python-agent   — tests · linting · IP audit · SDK validation
builder-agent  — Docker builds · ECR push · npm/Vite dashboard build
infra-agent    — Terraform · AWS CLI · ECS deploy · SageMaker · S3 sync
```

---

## First-time setup

### 1. Start the Jenkins controller only

```bash
cp .env.example .env
docker compose up -d jenkins
```

Wait ~60 seconds, then open http://localhost:8080.

### 2. Create nodes in Jenkins UI

Go to **Manage Jenkins → Nodes → New Node** for each agent.
Settings for every node:

| Field | Value |
|---|---|
| Type | Permanent Agent |
| # of executors | 2 |
| Remote root directory | `/home/jenkins/workspace` |
| Launch method | Launch agent by connecting it to the controller |

Set **Labels** per agent type:

| Node name | Labels |
|---|---|
| `python-agent-1` | `python` |
| `python-agent-2` | `python` |
| `builder-agent-1` | `builder` |
| `infra-agent-1` | `infra` |
| `infra-agent-2` | `infra` |

After saving each node, click on it and copy the **secret** shown on the status page.

### 3. Fill in .env

```bash
# Edit .env and paste each secret
PYTHON_AGENT_1_SECRET=abc123...
PYTHON_AGENT_2_SECRET=def456...
BUILDER_AGENT_1_SECRET=ghi789...
INFRA_AGENT_1_SECRET=jkl012...
INFRA_AGENT_2_SECRET=mno345...
```

### 4. Start all agents

```bash
docker compose up -d
```

All five agents will connect to Jenkins automatically. You should see them go
green in **Manage Jenkins → Nodes** within 30 seconds.

---

## How the pipelines use agents

Each stage in both Jenkinsfiles declares `agent { label 'python' }` (or
`builder` or `infra`). Jenkins schedules each stage on the first available
agent with the matching label.

```
Checkout          → python || builder || infra  (any available)
Install / Lint / Test / IP Audit / SDK   → python
Docker Build / ECR Push / npm Build      → builder
Terraform / ECS / SageMaker / S3 Sync   → infra
```

Two pipelines running at the same time (e.g. proprietary + a client deploy)
will use different agents concurrently — no queuing.

---

## Scaling for more client pilots

Add more infra agents for parallel client deployments:

```bash
# Deploy 3 infra agents instead of 2
docker compose up -d --scale infra-agent-1=3
```

Or add named agents to docker-compose.yml following the same pattern and
register each one in Jenkins as a new node with the `infra` label.

---

## Upgrading to EC2 when you outgrow local Docker

When you're past ~10 concurrent deployments, move agents to EC2:

1. Launch EC2 instances (t3.medium for python/infra, t3.large for builder)
2. Install Docker on each instance
3. Run the same Docker images with the same env vars
4. Update Jenkins node config to use SSH launch instead of JNLP

The Dockerfiles and entrypoint are identical — only the launch mechanism changes.
