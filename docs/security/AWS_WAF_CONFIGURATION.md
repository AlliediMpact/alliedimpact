# 🛡️ AWS WAF Configuration for Allied iMpact Platform

**Document Status**: Production Ready  
**Last Updated**: February 13, 2026  
**Author**: Allied iMpact Security Team  
**Compliance**: OWASP Top 10, PCI DSS, POPIA

---

## Executive Summary

This document outlines the AWS Web Application Firewall (WAF) configuration for the Allied iMpact multi-product platform. AWS WAF provides an additional layer of security beyond application-level protections, defending against common web exploits and bot attacks at the edge.

##  Why AWS WAF?

### Current Protection Stack
1. **Application Layer** (Next.js Middleware):
   - ✅ CSRF protection
   - ✅ Rate limiting (per-IP and per-user)
   - ✅ Input validation
   - ✅ Security headers

2. **Edge Layer** (AWS WAF) - **RECOMMENDED**:
   - 🔒 DDoS mitigation
   - 🔒 Geographic blocking
   - 🔒 Bot detection
   - 🔒 IP reputation filtering
   - 🔒 SQL injection protection
   - 🔒 XSS protection
   - 🔒 Request size limits

### Benefits
- **Performance**: Block malicious traffic before it reaches your application
- **Cost**: Reduced server load = lower compute costs
- **Compliance**: PCI DSS, HIPAA, SOC 2 requirements
- **Analytics**: Centralized security visibility across all products

---

## 📋 AWS WAF Rule Groups

### 1. Core Rule Set (CRS)
AWS Managed Rules - Free Tier included

```typescript
// Terraform Configuration
resource "aws_wafv2_web_acl" "alliedimpact_waf" {
  name  = "alliedimpact-production-waf"
  scope = "CLOUDFRONT" // or "REGIONAL" for ALB
  
  default_action {
    allow {}
  }
  
  // Core Rule Set (CRS) - OWASP Top 10 protection
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
        
        // Exclude rules that cause false positives
        excluded_rule {
          name = "SizeRestrictions_BODY" // Allow larger API payloads
        }
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-CRS-Metric"
    }
  }
}
```

**Protections**:
- ✅ SQL injection (SQLi)
- ✅ Cross-site scripting (XSS)
- ✅ Local File Inclusion (LFI)
- ✅ Remote File Inclusion (RFI)
- ✅ Command injection
- ✅ Path traversal

---

### 2. Known Bad Inputs Rule Set

```typescript
  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-KnownBadInputs-Metric"
    }
  }
```

**Protections**:
- ✅ Known attack patterns
- ✅ Malicious user agents
- ✅ Exploit attempts

---

### 3. Bot Control Rule Set

**CRITICAL for CoinBox (P2P trading fraud prevention)**

```typescript
  rule {
    name     = "AWS-AWSManagedRulesBotControlRuleSet"
    priority = 3
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesBotControlRuleSet"
        
        managed_rule_group_configs {
          aws_managed_rules_bot_control_rule_set {
            inspection_level = "TARGETED" // or "COMMON" (cheaper)
          }
        }
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-BotControl-Metric"
    }
  }
```

**Protections**:
- ✅ Credential stuffing
- ✅ Scraping bots
- ✅ Automated trading bots
- ✅ Account takeover attempts

**Cost**: ~$10/month/1M requests (Targeted), ~$1/month/1M requests (Common)

---

### 4. Rate-Based Rule (DDoS Protection)

```typescript
  rule {
    name     = "RateLimitRule"
    priority = 4
    
    action {
      block {
        custom_response {
          response_code = 429
          custom_response_body_key = "rate_limit_response"
        }
      }
    }
    
    statement {
      rate_based_statement {
        limit              = 2000 // requests per 5 minutes per IP
        aggregate_key_type = "IP"
        
        // Only apply to API endpoints
        scope_down_statement {
          byte_match_statement {
            positional_constraint = "STARTS_WITH"
            search_string         = "/api/"
            
            field_to_match {
              uri_path {}
            }
            
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule-Metric"
    }
  }
```

**Limits**:
- 🛡️ 2000 requests per 5 minutes per IP (API)
- 🛡️ Complements application-level rate limiting
- 🛡️ Protects against DDoS attacks

---

### 5. Geographic Restrictions

**Optional**: Block traffic from high-risk countries

```typescript
  rule {
    name     = "GeoBlockRule"
    priority = 5
    
    action {
      block {}
    }
    
    statement {
      geo_match_statement {
        country_codes = ["KP", "IR", "SY"] // North Korea, Iran, Syria
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "GeoBlockRule-Metric"
    }
  }
```

**Use Case**: Compliance with sanctions, fraud prevention

---

### 6. IP Reputation List

```typescript
  rule {
    name     = "AWS-AWSManagedRulesAmazonIpReputationList"
    priority = 6
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesAmazonIpReputationList"
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-IpReputation-Metric"
    }
  }
```

**Protections**:
- ✅ Known malicious IPs
- ✅ Botnet IPs
- ✅ Anonymous proxies
- ✅ Tor exit nodes

---

### 7. Custom Rule: Protect Auth Endpoints

```typescript
  rule {
    name     = "ProtectAuthEndpoints"
    priority = 7
    
    action {
      block {
        custom_response {
          response_code = 403
        }
      }
    }
    
    statement {
      and_statement {
        statement {
          // Match auth endpoints
          or_statement {
            statement {
              byte_match_statement {
                search_string         = "/api/auth"
                positional_constraint = "CONTAINS"
                field_to_match { uri_path {} }
                text_transformation { priority = 0; type = "NONE" }
              }
            }
            statement {
              byte_match_statement {
                search_string         = "/login"
                positional_constraint = "CONTAINS"
                field_to_match { uri_path {} }
                text_transformation { priority = 0; type = "NONE" }
              }
            }
          }
        }
        
        // Block if missing required headers
        statement {
          not_statement {
            statement {
              byte_match_statement {
                search_string         = "application/json"
                positional_constraint = "CONTAINS"
                field_to_match { single_header { name = "content-type" } }
                text_transformation { priority = 0; type = "LOWERCASE" }
              }
            }
          }
        }
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "AuthEndpointProtection-Metric"
    }
  }
```

---

### 8. Custom Rule: Block Request Body Size Exploits

```typescript
  rule {
    name     = "BlockLargeRequestBodies"
    priority = 8
    
    action {
      block {
        custom_response {
          response_code = 413 // Payload Too Large
        }
      }
    }
    
    statement {
      and_statement {
        statement {
          size_constraint_statement {
            size              = 1048576 // 1 MB
            comparison_operator = "GT"
            field_to_match {
              body {
                oversize_handling = "CONTINUE"
              }
            }
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }
        
        // Exclude file upload endpoints
        statement {
          not_statement {
            statement {
              byte_match_statement {
                search_string         = "/api/upload"
                positional_constraint = "STARTS_WITH"
                field_to_match { uri_path {} }
                text_transformation { priority = 0; type = "NONE" }
              }
            }
          }
        }
      }
    }
    
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "LargeBodyBlock-Metric"
    }
  }
```

---

## 📊 Logging and Monitoring

### CloudWatch Integration

```typescript
resource "aws_cloudwatch_log_group" "waf_logs" {
  name              = "/aws/waf/alliedimpact"
  retention_in_days = 30
}

resource "aws_wafv2_web_acl_logging_configuration" "waf_logging" {
  resource_arn            = aws_wafv2_web_acl.alliedimpact_waf.arn
  log_destination_configs = [aws_cloudwatch_log_group.waf_logs.arn]
  
  redacted_fields {
    single_header {
      name = "authorization" // Don't log JWT tokens
    }
  }
  
  redacted_fields {
    single_header {
      name = "cookie" // Don't log session cookies
    }
  }
}
```

### Metrics to Monitor

| Metric | Threshold | Alert Action |
|--------|-----------|--------------|
| `BlockedRequests` | > 1000/hour | SNS notification |
| `AllowedRequests` | < 100/hour | Check application health |
| `BotControlBlocks` | > 500/hour | Investigate credential stuffing |
| `RateLimitBlocks` | > 100/min | DDoS attack likely |

---

## 💰 Cost Estimation

### Monthly Costs (Production)

| Component | Requests/Month | Cost |
|-----------|----------------|------|
| **WAF ACL** (per rule) | N/A | $5/rule = $40 |
| **Request Processing** | 100M requests | $0.60/1M = $60 |
| **Bot Control (Targeted)** | 100M requests | $10/1M = $1,000 |
| **Bot Control (Common)** | 100M requests | $1/1M = $100 |
| **CloudWatch Logs** | 10 GB | $5 |

**Total Estimate**: ~$205/month (without Bot Control) or ~$1,105/month (with Targeted Bot Control)

### Cost Optimization
- Use **Common** bot control for non-financial apps: EduTech, DriveMaster, SportsHub
- Use **Targeted** bot control for CoinBox only (P2P trading fraud)
- Enable sampling: Log 10% of requests instead of 100%

---

## 🚀 Deployment Steps

### 1. Create WAF ACL
```bash
terraform init
terraform plan -out=waf.tfplan
terraform apply waf.tfplan
```

### 2. Associate with CloudFront / ALB
```typescript
resource "aws_cloudfront_distribution" "alliedimpact" {
  // ... existing config ...
  
  web_acl_id = aws_wafv2_web_acl.alliedimpact_waf.arn
}
```

### 3. Test Rules (Staging First)
```bash
# Test SQL injection block
curl -X POST https://staging.alliedimpact.co.za/api/test \
  -d "username=admin' OR '1'='1"

# Test rate limiting
for i in {1..3000}; do
  curl https://staging.alliedimpact.co.za/api/test &
done

# Test bot detection
curl -A "BadBot/1.0" https://staging.alliedimpact.co.za/
```

### 4. Enable Logging
```bash
aws wafv2 put-logging-configuration \
  --resource-arn arn:aws:wafv2:... \
  --log-destination-configs arn:aws:logs:...
```

### 5. Monitor Metrics
```bash
# CloudWatch Dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "AlliedImpact-WAF" \
  --dashboard-body file://waf-dashboard.json
```

---

## 🛠️ Maintenance

### Weekly Tasks
- [ ] Review blocked requests in CloudWatch
- [ ] Check for false positives
- [ ] Update IP reputation lists

### Monthly Tasks
- [ ] Review AWS managed rule updates
- [ ] Analyze cost vs. benefit of Bot Control
- [ ] Update geographic restrictions based on traffic patterns

### Quarterly Tasks
- [ ] Review compliance requirements (PCI DSS, POPIA)
- [ ] Penetration testing with WAF enabled
- [ ] Update custom rules based on new attack patterns

---

## 📚 References

- [AWS WAF Developer Guide](https://docs.aws.amazon.com/waf/latest/developerguide/)
- [AWS Managed Rules Documentation](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups.html)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)

---

## ✅ Pre-Launch Checklist

Before February 25, 2026 launch:

- [ ] Deploy WAF to staging environment (Feb 15-18)
- [ ] Run penetration tests with WAF enabled (Feb 19-20)
- [ ] Enable production WAF with CRS + IP Reputation (Feb 21)
- [ ] Add Bot Control to CoinBox only (Feb 22)
- [ ] Configure CloudWatch alerts (Feb 23)
- [ ] Final testing with all rules enabled (Feb 24)
- [ ] **GO LIVE** (Feb 25)

---

**Next Steps**: 
1. Review this configuration with security team
2. Provision AWS WAF in staging environment
3. Begin testing with Core Rule Set
4. Gradually enable additional rule groups
5. Monitor for 48 hours before production deployment
