# AWS Deployment Guide

This document outlines the steps to deploy Requester to AWS.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured
3. Docker installed locally (for testing)
4. GitHub repository with Actions enabled

## Deployment Options

### Option 1: Amazon ECS (Container-based)

This is the recommended approach for production deployments.

#### Setup Steps:

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name requester-app --region us-east-1
   ```

2. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name requester-cluster
   ```

3. **Create IAM Roles**
   - Create execution role for ECS tasks
   - Create task role for ECS tasks
   - Update `ecs-task-definition.json` with your role ARNs

4. **Create CloudWatch Log Group**
   ```bash
   aws logs create-log-group --log-group-name /ecs/requester-app
   ```

5. **Create ECS Service**
   ```bash
   aws ecs create-service \
     --cluster requester-cluster \
     --service-name requester-service \
     --task-definition requester-task-def \
     --desired-count 1 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
   ```

6. **Configure GitHub Secrets**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - Update workflow file with your ECR repository URI

### Option 2: S3 + CloudFront (Static Hosting)

For simpler deployments, you can host the static files on S3.

#### Setup Steps:

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://requester-app-bucket
   ```

2. **Enable Static Website Hosting**
   ```bash
   aws s3 website s3://requester-app-bucket \
     --index-document index.html \
     --error-document index.html
   ```

3. **Create CloudFront Distribution**
   - Point to S3 bucket
   - Set default root object to `index.html`
   - Configure caching behaviors

4. **Update GitHub Actions Workflow**
   - Set `Deploy to S3` step `if` condition to `true`
   - Add `CLOUDFRONT_DISTRIBUTION_ID` to GitHub secrets

## GitHub Actions Setup

1. Go to your repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `CLOUDFRONT_DISTRIBUTION_ID` (if using CloudFront)

## Environment Variables

No environment variables are required for the basic setup. If you need to configure API endpoints or other settings, you can:

1. Add them to the ECS task definition
2. Use AWS Systems Manager Parameter Store
3. Use AWS Secrets Manager

## Monitoring

- CloudWatch Logs: `/ecs/requester-app`
- CloudWatch Metrics: ECS service metrics
- Application Load Balancer: If configured

## Cost Optimization

- Use Fargate Spot for non-production environments
- Configure auto-scaling based on CPU/memory
- Use CloudFront caching for static assets
- Enable S3 lifecycle policies if using S3 hosting

## Troubleshooting

1. **Check ECS Task Logs**
   ```bash
   aws logs tail /ecs/requester-app --follow
   ```

2. **Verify ECR Image**
   ```bash
   aws ecr describe-images --repository-name requester-app
   ```

3. **Check ECS Service Status**
   ```bash
   aws ecs describe-services --cluster requester-cluster --services requester-service
   ```

