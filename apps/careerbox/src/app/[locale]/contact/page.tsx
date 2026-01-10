'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToastHelpers } from '@/components/ui/toast';
import {
  validateRequired,
  validateEmail,
  validateMinLength,
} from '@/utils/validation';

export default function ContactPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { success: showSuccess, error: showError } = useToastHelpers();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return validateRequired(value, 'Name')?.error || validateMinLength(value, 2, 'Name')?.error || '';
      case 'email':
        return validateRequired(value, 'Email')?.error || validateEmail(value)?.error || '';
      case 'subject':
        return validateRequired(value, 'Subject')?.error || validateMinLength(value, 5, 'Subject')?.error || '';
      case 'message':
        return validateRequired(value, 'Message')?.error || validateMinLength(value, 20, 'Message')?.error || '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (Object.keys(newErrors).length > 0) {
      showError('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call API to send message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setTouched({});
      setErrors({});
    } catch (error) {
      showError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      className={errors.name && touched.name ? 'border-red-500' : ''}
                    />
                    {errors.name && touched.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="john@example.com"
                      className={errors.email && touched.email ? 'border-red-500' : ''}
                    />
                    {errors.email && touched.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="How can we help?"
                      className={errors.subject && touched.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && touched.subject && (
                      <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.message && touched.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.message && touched.message && (
                      <p className="text-sm text-red-600 mt-1">{errors.message}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Minimum 20 characters ({formData.message.length}/20)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Office Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Office Address</h3>
                    <p className="text-gray-600 text-sm">
                      123 Business Street<br />
                      Sandton<br />
                      Johannesburg, 2196<br />
                      South Africa
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                    <a
                      href="mailto:support@alliedimpact.co.za"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      support@alliedimpact.co.za
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      General inquiries
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                    <a
                      href="tel:+27111234567"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      +27 (0) 11 123 4567
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      Mon-Fri, 9am-5pm SAST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Business Hours</h3>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>Monday - Friday: 9am - 5pm</p>
                      <p>Saturday: 10am - 2pm</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
