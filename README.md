# BhaveshPay — Docker Swarm + Jenkins CI/CD

A fictional digital-wallet **frontend demo** for a learning portfolio. It does not connect to banks, UPI, payment gateways, or real accounts. Transfers update the page locally and reset on refresh.

## Stack
HTML, CSS, JavaScript, NGINX, Docker, AWS EC2, Docker Swarm, Docker Hub, Jenkins.

## Run locally
```bash
docker build -t bhaveshpay-web:latest .
docker run --rm -p 8080:80 bhaveshpay-web:latest
```
Open `http://localhost:8080`.

## Push source to your GitHub repository
If your repository is empty, run these commands from this project folder:
```bash
git init
git add .
git commit -m "Add BhaveshPay demo app and deployment files"
git branch -M main
git remote add origin https://github.com/patilbhavesh1008-arch/BhaveshPay-Devops.git
git push -u origin main
```
If GitHub already contains a README or other commit, clone the repository first and copy these files into it, then commit and push.

## AWS security essentials
Use an Amazon Linux AMI currently offered by AWS (Amazon Linux 2023 is common). Restrict SSH (22) to your own IP. For the demo, allow TCP 8080 only from your IP. Do not expose Jenkins publicly. If Jenkins and the app share the same EC2 host, use a different host port for Jenkins (for example 8081 mapped to container port 8080) and keep it restricted to your IP.

For the Swarm lab, use one manager and two workers. Permit TCP 2377, TCP/UDP 7946 and UDP 4789 between only the three instances using a security-group reference. Use private IPs for node-to-node communication.

## Install Docker on each Amazon Linux instance
Connect with MobaXterm SSH to each instance:
```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
```
Log out and reconnect so group membership applies. Test `docker --version` and `docker ps`. If Docker is not available for the AMI you selected, use the official Docker installation instructions for that exact Amazon Linux release.

Set the matching hostname on each instance:
```bash
sudo hostnamectl set-hostname manager
sudo hostnamectl set-hostname worker1
sudo hostnamectl set-hostname worker2
```
Run only the relevant command on each machine.

## Initialize Docker Swarm
On the manager:
```bash
docker swarm init --advertise-addr <MANAGER_PRIVATE_IP>
docker swarm join-token worker
```
Copy the join command printed by Docker and run it on worker1 and worker2. Treat join tokens as secrets. On manager:
```bash
docker node ls
```
Wait until both workers are `Ready` and `Active`.

## Test the app on the manager
```bash
git clone https://github.com/patilbhavesh1008-arch/BhaveshPay-Devops.git
cd BhaveshPay-Devops
docker build -t bhaveshpay-web:latest .
docker run -d --name bhaveshpay-test -p 8080:80 bhaveshpay-web:latest
```
Open `http://<MANAGER_PUBLIC_IP>:8080` if the EC2 security group permits TCP 8080 from your IP. Remove the test container before stack deployment:
```bash
docker rm -f bhaveshpay-test
```

## Docker Hub and Jenkins credentials
Create a Docker Hub access token with limited permissions. In Jenkins > Manage Jenkins > Credentials, add:
- Kind: Username with password
- ID: `dockerhub-creds`
- Username: your Docker Hub username
- Password: your Docker Hub access token

Never put passwords or tokens in the repository, Jenkinsfile, screenshots, or shell history.

The Jenkinsfile assumes Jenkins runs on the manager, or on a host configured to control that Swarm and use its Docker daemon. Jenkins needs Docker CLI access and permissions to the Docker daemon. Do **not** use `chmod 777 /var/run/docker.sock`; access to this socket is effectively root-level host access. Create a Jenkins Pipeline job connected to this GitHub repo and configure it to use the repository's `Jenkinsfile`.

## Deploy the stack
On a Swarm manager, once the image is pushed to Docker Hub:
```bash
export DOCKERHUB_USER=<your_dockerhub_username>
export IMAGE_TAG=latest
docker stack deploy --with-registry-auth -c docker-compose.yml bhaveshpay-stack
docker stack services bhaveshpay-stack
docker stack ps bhaveshpay-stack
```
Open `http://<MANAGER_PUBLIC_IP>:8080`. Swarm routing mesh can publish the service port on any node if network rules allow it.

## Useful commands
```bash
docker node ls
docker service ls
docker service ps bhaveshpay-stack_bhaveshpay
docker service logs -f bhaveshpay-stack_bhaveshpay
docker stack rm bhaveshpay-stack
docker system df
```

## Troubleshooting
- Confirm workers show `Ready` and `Active` in `docker node ls`.
- Check replica counts with `docker stack services bhaveshpay-stack`.
- For browser connection issues, check the EC2 security-group rule for TCP 8080 from your IP and inspect service logs.
- If workers cannot pull the image, ensure the repository is public or configure registry authentication.
- Stop and terminate lab resources when finished; check EC2, EBS volumes, Elastic IPs, and load balancers for ongoing charges.

## Architecture
Developer → GitHub → Jenkins → Docker build → Docker Hub → Docker Swarm manager → app replicas.
