# Firestore Backup Configuration Guide

**Date**: January 3, 2026  
**Purpose**: Automated daily backups for disaster recovery and compliance  
**Retention**: 30 days

---

## 🎯 Overview

Firestore backups protect against:
- Accidental data deletion
- Malicious data corruption
- Application bugs causing data loss
- Compliance requirements (data retention)

---

## 🔧 Setup Methods

### Method 1: Firebase Console (Recommended for Quick Setup)

#### Step 1: Enable Firestore Backups
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Backups** tab
5. Click **Enable automated backups**

#### Step 2: Configure Backup Schedule
1. **Frequency**: Daily at 2:00 AM (low-traffic time)
2. **Retention**: 30 days
3. **Location**: Same region as Firestore (for cost optimization)
4. **Bucket**: Auto-created by Firebase

#### Step 3: Set Up Notifications (Optional)
1. Go to **Project Settings** → **Integrations**
2. Enable Cloud Functions for backup notifications
3. Configure email/Slack alerts for failed backups

---

### Method 2: gcloud CLI (Recommended for Automation)

#### Prerequisites
```bash
# Install gcloud CLI
https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

#### Enable Firestore Backup API
```bash
gcloud services enable firestore.googleapis.com
```

#### Create Backup Schedule
```bash
# Create daily backup at 2 AM
gcloud firestore backups schedules create \
  --database="(default)" \
  --recurrence=daily \
  --retention=30d \
  --backup-time="02:00"
```

#### Verify Backup Schedule
```bash
gcloud firestore backups schedules list
```

---

### Method 3: Terraform (Infrastructure as Code)

```hcl
resource "google_firestore_backup_schedule" "daily_backup" {
  project  = var.project_id
  database = "(default)"

  # Daily at 2 AM
  daily_recurrence {}

  retention = "2592000s" # 30 days in seconds

  # Optional: specify backup location
  backup_location = var.firestore_region
}
```

Apply with:
```bash
terraform init
terraform plan
terraform apply
```

---

## 📦 Backup Storage

### Storage Location
- **Bucket Name**: `gs://your-project-id-firestore-backups`
- **Region**: Same as Firestore (e.g., `us-central1`)
- **Storage Class**: Standard (for frequent access)

### Cost Estimation
- **Firestore Backup**: $0.15/GB/month
- **Cloud Storage**: $0.02/GB/month
- **Example**: 10GB database = ~$1.70/month

### Cost Optimization
- Use `nearline` storage class for older backups
- Set up lifecycle policies to auto-delete after retention period

---

## 🔄 Restore Process

### Option 1: Firebase Console (GUI)
1. Go to **Firestore Database** → **Backups**
2. Select backup to restore
3. Click **Restore**
4. Choose destination:
   - New database (recommended for testing)
   - Overwrite existing (use with caution)
5. Confirm and wait for restoration

**Duration**: 5-30 minutes depending on database size

---

### Option 2: gcloud CLI (Automated)

#### List Available Backups
```bash
gcloud firestore backups list
```

#### Restore to New Database
```bash
gcloud firestore databases restore \
  --source-backup=BACKUP_NAME \
  --destination-database=restored-db
```

#### Restore to Existing Database (⚠️ Overwrites Data)
```bash
gcloud firestore databases restore \
  --source-backup=BACKUP_NAME \
  --destination-database="(default)"
```

---

## 🧪 Testing Restore Process

### Test Procedure (Quarterly)
1. Create test Firebase project
2. Restore latest backup to test project
3. Verify data integrity:
   - Check document counts
   - Verify relationships between collections
   - Test application functionality
4. Document any issues
5. Delete test project

### Automated Test Script
```bash
#!/bin/bash
# test-restore.sh

PROJECT_ID="your-project-id"
TEST_PROJECT="your-project-id-restore-test"

# Get latest backup
LATEST_BACKUP=$(gcloud firestore backups list \
  --project=$PROJECT_ID \
  --format="value(name)" \
  --limit=1)

# Restore to test project
gcloud firestore databases restore \
  --source-backup=$LATEST_BACKUP \
  --destination-database="(default)" \
  --project=$TEST_PROJECT

echo "Restore test complete. Verify data in test project."
```

---

## 📊 Monitoring Backups

### Cloud Monitoring Alerts

#### Backup Failure Alert
```yaml
# alert-policy.yaml
displayName: "Firestore Backup Failure"
conditions:
  - displayName: "Backup failed"
    conditionThreshold:
      filter: 'resource.type="firestore_backup" AND metric.type="firestore.googleapis.com/backup/status" AND metric.label.status="FAILED"'
      comparison: COMPARISON_GT
      thresholdValue: 0
      duration: 60s
notificationChannels:
  - projects/YOUR_PROJECT/notificationChannels/YOUR_CHANNEL_ID
```

#### Backup Age Alert (Data Not Being Backed Up)
```yaml
displayName: "Firestore Backup Too Old"
conditions:
  - displayName: "No backup in 25 hours"
    conditionThreshold:
      filter: 'resource.type="firestore_backup"'
      aggregations:
        - alignmentPeriod: 3600s
          perSeriesAligner: ALIGN_MAX
      comparison: COMPARISON_GT
      thresholdValue: 90000 # 25 hours in seconds
```

---

## 🔐 Security & Access Control

### IAM Roles Required

#### For Backup Creation
```
roles/datastore.importExportAdmin
```

#### For Restore Operations
```
roles/datastore.owner
```

#### Read-Only Access (Monitoring)
```
roles/datastore.viewer
```

### Service Account Setup
```bash
# Create service account for backups
gcloud iam service-accounts create firestore-backup-sa \
  --display-name="Firestore Backup Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:firestore-backup-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.importExportAdmin"
```

---

## 📋 Backup Verification Checklist

### Daily (Automated)
- [ ] Backup completed successfully
- [ ] Backup size within expected range (±20% of previous)
- [ ] No errors in backup logs

### Weekly (Manual Review)
- [ ] Review backup storage costs
- [ ] Verify retention policy is working (old backups deleted)
- [ ] Check backup schedule is still active

### Monthly (Disaster Recovery Test)
- [ ] Test restore process in staging environment
- [ ] Verify data integrity after restore
- [ ] Document restore time and any issues
- [ ] Update disaster recovery documentation

---

## 🚨 Disaster Recovery Procedures

### Scenario 1: Accidental Data Deletion
1. **Stop application** to prevent further changes
2. **Identify backup** closest to before deletion
3. **Restore to new database** for verification
4. **Switch application** to restored database
5. **Document incident** and update procedures

**RTO (Recovery Time Objective)**: 1 hour  
**RPO (Recovery Point Objective)**: 24 hours (daily backups)

---

### Scenario 2: Data Corruption
1. **Identify corruption timestamp**
2. **Find clean backup** before corruption
3. **Restore to staging** for testing
4. **Verify data integrity** with automated tests
5. **Deploy to production** after verification

---

### Scenario 3: Complete Database Loss
1. **Declare incident** to stakeholders
2. **Restore latest backup** immediately
3. **Accept data loss** since last backup
4. **Communicate impact** to users
5. **Post-mortem analysis**

---

## 📝 Implementation Script

```bash
#!/bin/bash
# setup-firestore-backups.sh

set -e

PROJECT_ID="your-project-id"
REGION="us-central1"
RETENTION_DAYS=30

echo "Setting up Firestore backups for project: $PROJECT_ID"

# Enable required APIs
echo "Enabling APIs..."
gcloud services enable firestore.googleapis.com \
  --project=$PROJECT_ID

# Create backup schedule
echo "Creating daily backup schedule..."
gcloud firestore backups schedules create \
  --database="(default)" \
  --recurrence=daily \
  --retention="${RETENTION_DAYS}d" \
  --backup-time="02:00" \
  --project=$PROJECT_ID

# Verify setup
echo "Verifying backup schedule..."
gcloud firestore backups schedules list --project=$PROJECT_ID

echo "✅ Firestore backups configured successfully!"
echo "Backups will run daily at 2:00 AM with ${RETENTION_DAYS}-day retention."
```

Make executable and run:
```bash
chmod +x setup-firestore-backups.sh
./setup-firestore-backups.sh
```

---

## ✅ Phase 1 Backup Status

**Task**: Configure Firestore Backups  
**Status**: ✅ **Documentation Complete** - Implementation requires GCP access  
**Duration**: 15 minutes (with GCP access)

### What's Ready
- ✅ Complete setup guide (3 methods)
- ✅ Restore procedures documented
- ✅ Monitoring and alerting configuration
- ✅ Disaster recovery procedures
- ✅ Automated setup script

### Implementation Steps (Team Action Required)
1. **Authenticate with GCP** (5 minutes)
   ```bash
   gcloud auth login
   gcloud config set project your-project-id
   ```

2. **Run Setup Script** (2 minutes)
   ```bash
   ./setup-firestore-backups.sh
   ```

3. **Verify Backup Schedule** (1 minute)
   ```bash
   gcloud firestore backups schedules list
   ```

4. **Test Restore Process** (5-30 minutes)
   - Create test project
   - Restore latest backup
   - Verify data integrity

5. **Set Up Monitoring** (5 minutes)
   - Configure backup failure alerts
   - Add notification channels (email/Slack)

**Total Implementation Time**: 15-45 minutes (depending on backup size for testing)

---

## 🎯 Success Criteria

| Criteria | Status | Notes |
|----------|--------|-------|
| Backup documentation | ✅ | Complete guide created |
| Setup methods provided | ✅ | Console, CLI, and Terraform |
| Restore procedures | ✅ | Documented with examples |
| Monitoring configuration | ✅ | Alert policies defined |
| Disaster recovery plan | ✅ | RTO/RPO defined |
| Automated script | ✅ | Ready to execute |
| Test procedures | ✅ | Quarterly testing plan |

**Overall**: Firestore backup configuration is fully documented and ready for immediate implementation.

---

## 📞 Support & Resources

- [Firebase Backups Documentation](https://firebase.google.com/docs/firestore/backups)
- [gcloud firestore backups commands](https://cloud.google.com/sdk/gcloud/reference/firestore/backups)
- [Disaster Recovery Best Practices](https://cloud.google.com/architecture/dr-scenarios-planning-guide)
