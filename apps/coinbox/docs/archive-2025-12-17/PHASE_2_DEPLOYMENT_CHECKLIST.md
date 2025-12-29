# Phase 2 Deployment Checklist

## ✅ Pre-Deployment

### 1. Environment Configuration
- [ ] Copy `functions/.env.example` to `functions/.env`
- [ ] Add Paystack Secret Key (`PAYSTACK_SECRET_KEY`)
- [ ] Add Paystack Public Key (`PAYSTACK_PUBLIC_KEY`)
- [ ] Add Paystack Webhook Secret (`PAYSTACK_WEBHOOK_SECRET`)
- [ ] Set callback URL (`PAYSTACK_CALLBACK_URL`)
- [ ] Configure Firebase project ID

### 2. Dependencies
```bash
# Install functions dependencies
cd functions
npm install

# Install client dependencies (if not already)
cd ..
npm install firebase firebase-admin
```

### 3. Build & Test Locally
```bash
# Build functions
cd functions
npm run build

# Start emulators
firebase emulators:start

# Test in another terminal
npm run dev
```

### 4. Security Rules
- [ ] Review `firestore.rules` for wallet protection
- [ ] Ensure no client-side wallet writes allowed
- [ ] Test rules with emulator

---

## 🚀 Deployment Steps

### 1. Deploy Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:createOrder,releaseCrypto
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 4. Set Production Environment Variables
```bash
firebase functions:config:set \
  paystack.secret_key="sk_live_your_key" \
  paystack.public_key="pk_live_your_key" \
  paystack.webhook_secret="your_secret"

# View config
firebase functions:config:get
```

### 5. Deploy Frontend
```bash
npm run build
# Deploy to Vercel/Netlify or your hosting
```

---

## 🔧 Post-Deployment Configuration

### 1. Paystack Webhook Setup
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-region-your-project.cloudfunctions.net/paystackWebhook`
3. Copy webhook secret to environment variables

### 2. Test Deposit Flow
```bash
# Use Paystack test mode first
# Test card: 4084084084084081
```
- [ ] Initialize deposit
- [ ] Complete payment on Paystack
- [ ] Verify webhook received
- [ ] Check wallet credited

### 3. Test Withdrawal Flow
- [ ] Add test bank account
- [ ] Request withdrawal
- [ ] Verify Paystack transfer initiated
- [ ] Check wallet debited

### 4. Test P2P Flow
- [ ] Create offer
- [ ] Create order (escrow locks)
- [ ] Mark as paid
- [ ] Release crypto
- [ ] Verify escrow released

---

## 📊 Monitoring Setup

### 1. Cloud Function Logs
```bash
# View logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --follow

# Filter by function
firebase functions:log --only createOrder
```

### 2. Firestore Console
Monitor these collections:
- `wallets` - Check balance consistency
- `transactions` - Audit trail
- `p2p_orders` - Order statuses
- `escrow_locks` - Locked funds
- `fraud_logs` - Security alerts

### 3. Key Metrics
Set up alerts for:
- Failed transactions (> 5%)
- High-risk users (auto-suspend)
- Disputed orders
- Auto-cancelled orders
- Escrow lock/release mismatches

---

## 🛡️ Security Checklist

### Firestore Rules
- [ ] ❌ Wallets: No client writes
- [ ] ❌ Transactions: No client writes
- [ ] ❌ Orders: No client writes
- [ ] ❌ Escrow locks: No client access
- [ ] ✅ Users can read own data only
- [ ] ✅ Admin override enabled

### Function Security
- [ ] All functions require authentication
- [ ] Input validation on all params
- [ ] Rate limiting enabled
- [ ] Fraud detection active
- [ ] Transaction atomicity guaranteed

### API Keys
- [ ] Paystack keys are in `.env` (not committed)
- [ ] Firebase service account secured
- [ ] Webhook secrets configured
- [ ] Environment variables set in production

---

## 🧪 Testing Checklist

### Wallet Tests
- [ ] Create wallet on signup
- [ ] Deposit via Paystack
- [ ] Verify deposit webhook
- [ ] Get balance
- [ ] Request withdrawal
- [ ] Transaction history

### P2P Tests
- [ ] Create buy offer
- [ ] Create sell offer
- [ ] Search marketplace
- [ ] Update offer
- [ ] Pause/resume offer
- [ ] Delete offer

### Escrow Tests
- [ ] Create order (locks escrow)
- [ ] Mark as paid
- [ ] Release crypto
- [ ] Cancel order (unlocks escrow)
- [ ] Auto-cancel expired order
- [ ] Open dispute

### Fraud Tests
- [ ] Rapid order creation blocked
- [ ] Multiple unpaid orders blocked
- [ ] High-risk user suspended
- [ ] Excessive cancellations logged

---

## 🚨 Rollback Plan

If issues occur:

### 1. Disable Problematic Functions
```bash
firebase functions:delete functionName
```

### 2. Revert Firestore Rules
```bash
firebase deploy --only firestore:rules
# Use previous rules file
```

### 3. Emergency Wallet Freeze
Add to Firestore security rules:
```javascript
match /wallets/{userId} {
  allow read, write: if false;  // Emergency freeze
}
```

### 4. Contact Support
- Check Paystack status page
- Review Firebase status
- Contact support if needed

---

## 📈 Performance Optimization

### After 1 Week
- [ ] Review function execution times
- [ ] Optimize slow queries
- [ ] Add composite indexes if needed
- [ ] Review rate limits

### After 1 Month
- [ ] Analyze user behavior
- [ ] Adjust fraud thresholds
- [ ] Optimize escrow window times
- [ ] Review transaction fees

---

## 📞 Support Contacts

**Paystack Support:**
- Email: support@paystack.com
- Dashboard: https://dashboard.paystack.com

**Firebase Support:**
- Console: https://console.firebase.google.com
- Support: https://firebase.google.com/support

**Documentation:**
- Phase 2 Complete: `/docs/PHASE_2_COMPLETE.md`
- Quick Reference: `/docs/PHASE_2_QUICK_REFERENCE.md`
- API Docs: `/functions/src/types/index.ts`

---

## ✅ Final Verification

Before going live:
- [ ] All tests passing
- [ ] Security rules deployed
- [ ] Functions deployed
- [ ] Indexes deployed
- [ ] Paystack webhook configured
- [ ] Environment variables set
- [ ] Monitoring enabled
- [ ] Backup plan ready
- [ ] Support team briefed

---

## 🎉 Go Live!

Once all checks pass:
1. Switch Paystack to live mode
2. Update environment variables
3. Deploy final build
4. Monitor logs closely
5. Announce to users

---

**Good luck with deployment! 🚀**
