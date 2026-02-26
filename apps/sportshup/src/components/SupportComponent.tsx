'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function SupportComponent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would send to a Cloud Function
      // const response = await fetch('/api/support', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Contact Information Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Mail className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Get a response within 24 hours
              </p>
              <a 
                href="mailto:support@sportshub.com" 
                className="text-sm text-primary hover:underline"
              >
                support@sportshub.com
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Chat with our team
              </p>
              <Button variant="link" className="text-sm p-0 h-auto">
                Start a conversation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium mb-1">Response Time</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Average response time
              </p>
              <p className="text-sm font-medium">2-4 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Submit a Support Request
          </CardTitle>
          <CardDescription>
            Fill out the form below and our team will get back to you as soon as possible
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitStatus === 'success' && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Your support request has been submitted successfully! We'll respond within 24 hours.
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                There was an error submitting your request. Please try again or email us directly.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Issue Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="account">Account & Login</SelectItem>
                  <SelectItem value="voting">Voting Issue</SelectItem>
                  <SelectItem value="wallet">Wallet & Payments</SelectItem>
                  <SelectItem value="tournament">Tournament Question</SelectItem>
                  <SelectItem value="refund">Refund Request</SelectItem>
                  <SelectItem value="abuse">Report Abuse</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Please provide detailed information about your issue..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Include any error messages, screenshots, or relevant details
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  name: '',
                  email: '',
                  category: '',
                  subject: '',
                  message: '',
                })}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Help Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Before You Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Many common issues can be resolved quickly by checking our resources:
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
            <li>Check the <a href="/help-center" className="text-primary hover:underline">Help Center</a> for guides and tutorials</li>
            <li>Review our <a href="/help-center" className="text-primary hover:underline">FAQs</a> for answers to common questions</li>
            <li>Watch our <a href="/help-center" className="text-primary hover:underline">video tutorials</a> for step-by-step instructions</li>
            <li>Visit the <a href="/dashboard" className="text-primary hover:underline">Dashboard</a> to check your account status</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
