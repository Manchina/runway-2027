# AWS Serverless Deployment Guide: Runway 2027

This guide walks you through deploying **Runway 2027** to AWS using the **100% Always-Free Tier**:
* **Backend**: AWS Lambda (Hono Node.js 20) with Bot Shield (API Key + Concurrency Hard-Cap of 2)
* **Database**: AWS DynamoDB (Always-Free 25 GB indexed storage)
* **Frontend**: AWS S3 + AWS CloudFront (Always-Free 1 TB/month transfer + free `*.cloudfront.net` domain)
* **Estimated Monthly Cost**: **$0.00**

---

## Pre-Built Artifacts Ready in Your Repo:
1. `backend/dist/lambda.zip` (11.5 KB pre-bundled Lambda package with `index.handler`)
2. `dist/` (Optimized production build of the frontend with full dark-mode UI)

---

## Phase 1: Create the DynamoDB Table (2 Minutes)

### Via AWS Console:
1. Open [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/).
2. Click **Create table**.
3. Set:
   * **Table name**: `runway_2027`
   * **Partition key**: `pk` (String)
   * **Sort key**: `sk` (String)
4. Under **Table settings**, choose **Customize settings**:
   * Select **Provisioned** capacity.
   * Set **Read capacity**: `5` (Free Tier allows up to 25)
   * Set **Write capacity**: `5` (Free Tier allows up to 25)
   * (Or select **On-Demand** — first 1M writes & 2.5M reads are free every month).
5. Click **Create table**.

*(CLI Shortcut)*:
```bash
aws dynamodb create-table \
    --table-name runway_2027 \
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

---

## Phase 2: Deploy the AWS Lambda Function (3 Minutes)

### Via AWS Console:
1. Open [AWS Lambda Console](https://console.aws.amazon.com/lambda/).
2. Click **Create function**:
   * Function name: `runway-api`
   * Runtime: **Node.js 20.x** (or Node.js 22.x)
   * Architecture: **x86_64**
3. Click **Create function**.
4. In the **Code** tab:
   * Click **Upload from** -> **.zip file**.
   * Upload `backend/dist/lambda.zip` from your project folder.
5. In the **Runtime settings** (below the code editor):
   * Click **Edit**.
   * Change **Handler** to: `index.handler`
   * Click **Save**.
6. In the **Configuration** -> **Environment variables** tab:
   * Add:
     * `DYNAMO_TABLE` = `runway_2027`
     * `RUNWAY_API_KEY` = `my-secret-key-123` *(replace with any secret password you like; this is your Bot Shield)*
7. In the **Configuration** -> **Permissions** tab:
   * Click your Execution role name to open IAM.
   * Click **Add permissions** -> **Attach policies**.
   * Attach `AmazonDynamoDBFullAccess` (or create an inline policy for `runway_2027`).
8. In the **Configuration** -> **Concurrency** tab:
   * Click **Edit**.
   * Set **Reserved concurrency**: `2`
   * *(This is your financial seatbelt: AWS will physically forbid more than 2 concurrent executions, making it impossible for bot traffic to run up a bill).*
9. In the **Configuration** -> **Function URL** tab:
   * Click **Create Function URL**.
   * Auth type: **NONE** (our Lambda code inspects `x-runway-key` via the Bot Shield).
   * Configure CORS:
     * Allow origin: `*`
     * Allow headers: `*`
     * Allow methods: `*`
   * Click **Save**.
   * **Copy your Function URL**: `https://<random-id>.lambda-url.<region>.on.aws/`

---

## Phase 3: Deploy Frontend to S3 + CloudFront (3 Minutes)

### Step 1: Upload to S3
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/).
2. Create bucket: `runway-2027-web-<your-name>` (leave "Block all public access" ON — CloudFront will serve it securely via OAC).
3. Upload all files from your local `dist/` directory into the root of this bucket.

### Step 2: Create CloudFront Distribution
1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/).
2. Click **Create distribution**:
   * **Origin domain**: Select your S3 bucket.
   * **Origin access**: Select **Origin access control settings (recommended)** and create control setting.
   * **Viewer protocol policy**: **Redirect HTTP to HTTPS**.
   * **Default root object**: `index.html`.
3. Click **Create distribution**.
4. (S3 Policy Notice): Copy the policy prompt CloudFront gives you and paste it into your S3 bucket's **Permissions -> Bucket Policy**.
5. In CloudFront -> **Error pages** tab:
   * Click **Create custom error response**:
     * HTTP error code: **403: Forbidden**
     * Customize error response: **Yes**
     * Response page path: `/index.html`
     * HTTP Response code: **200: OK**
   * Create another custom error response for **404: Not Found** -> `/index.html` -> **200: OK**.
   * *(This allows client-side routing to work on refresh).*
6. Copy your free CloudFront domain: `https://dXXXXXXXXXXXXX.cloudfront.net`.

---

## Phase 4: Connect the Cockpit!

1. Open your CloudFront URL `https://dXXXXXXXXXXXXX.cloudfront.net` in your browser.
2. In the top navigation bar, click the **Cloud** button (or click **Local Storage Mode**).
3. Paste:
   * **AWS Lambda Function URL**: `https://<random-id>.lambda-url.<region>.on.aws`
   * **Bot Shield Secret Key**: `my-secret-key-123`
4. Click **Test Connection**. You'll see:
   `Successfully connected to AWS Lambda + DynamoDB!`
5. Click **Upload Local Data to Cloud** to migrate any existing progress into your DynamoDB table.

You now have a 100% production-ready, bot-shielded, full-stack serverless app running on AWS for **$0.00/month**.
