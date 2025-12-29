'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SavingsJarFAQ from './FAQ';
import { BookOpen, HelpCircle, Video, Mail } from 'lucide-react';

const guides = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    content: [
      '1. Your Savings Jar is automatically created when you first use the feature',
      '2. Set your auto-save threshold (default is R100)',
      '3. Receive P2P payments - excess amounts are automatically saved',
      '4. Watch your savings grow!',
    ],
  },
  {
    title: 'Making Deposits',
    icon: BookOpen,
    content: [
      '1. Go to your Savings Jar dashboard',
      '2. Enter the amount you want to deposit',
      '3. Click "Deposit" to transfer from your main wallet',
      '4. Your balance updates immediately',
    ],
  },
  {
    title: 'Making Withdrawals',
    icon: BookOpen,
    content: [
      '1. Go to your Savings Jar dashboard',
      '2. Enter the amount you want to withdraw',
      '3. Review the 1% fee that will be deducted',
      '4. Click "Withdraw" to transfer to your main wallet',
      '5. The net amount (minus fee) appears in your wallet',
    ],
  },
  {
    title: 'Understanding Analytics',
    icon: BookOpen,
    content: [
      '1. Navigate to the Analytics tab',
      '2. View your savings rate and trends',
      '3. Compare deposits vs withdrawals',
      '4. Read personalized insights and tips',
      '5. Adjust your strategy based on patterns',
    ],
  },
];

const videoTutorials = [
  {
    title: 'Introduction to Savings Jar',
    duration: '2:30',
    description: 'Learn the basics of automatic savings',
  },
  {
    title: 'Setting Your Auto-Save Threshold',
    duration: '1:45',
    description: 'Customize how much you save automatically',
  },
  {
    title: 'Deposits and Withdrawals',
    duration: '3:15',
    description: 'Master the deposit and withdrawal process',
  },
  {
    title: 'Understanding Your Analytics',
    duration: '4:00',
    description: 'Make sense of your savings data',
  },
];

export default function HelpCenter() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Help Center</h2>
        <p className="text-muted-foreground">Everything you need to know about Savings Jar</p>
      </div>

      <Tabs defaultValue="guides" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <guide.icon className="h-5 w-5" />
                    {guide.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {guide.content.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <SavingsJarFAQ />
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoTutorials.map((video, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      {video.title}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {video.duration}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                  <button className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                    Watch Tutorial
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Need More Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Get help from our support team within 24 hours
                </p>
                <a
                  href="mailto:support@coinbox.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  support@coinbox.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Common Issues</h3>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground">
                    • Withdrawal not appearing in wallet → Check your transaction history
                  </li>
                  <li className="text-sm text-muted-foreground">
                    • Auto-save not working → Verify your threshold settings
                  </li>
                  <li className="text-sm text-muted-foreground">
                    • Balance seems incorrect → Refresh the page and check again
                  </li>
                  <li className="text-sm text-muted-foreground">
                    • Can't deposit → Ensure you have sufficient balance in main wallet
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Report a Bug</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Found a technical issue? Let us know with details:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>What you were trying to do</li>
                  <li>What happened instead</li>
                  <li>Any error messages you saw</li>
                  <li>Screenshots if possible</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
