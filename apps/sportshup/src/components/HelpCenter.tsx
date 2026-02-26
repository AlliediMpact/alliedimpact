'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  MessageSquare, 
  Video, 
  FileText,
  Trophy,
  Vote,
  Wallet,
  Shield,
  User,
  Clock,
  Award,
  Users,
  ChevronRight
} from 'lucide-react';

interface GuideCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  guides: Guide[];
}

interface Guide {
  id: string;
  title: string;
  description: string;
  contentType: 'article' | 'video' | 'tutorial';
  time: string;
  path: string;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("guides");
  
  const guideCategories: GuideCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Essential guides for new users',
      icon: <User className="h-5 w-5" />,
      guides: [
        {
          id: 'platform-introduction',
          title: 'SportsHub Platform Introduction',
          description: 'Learn about the SportsHub community voting platform and its core features',
          contentType: 'tutorial',
          time: '5 min',
          path: '/tutorials/introduction'
        },
        {
          id: 'account-setup',
          title: 'Setting Up Your Account',
          description: 'Complete your profile and get started with voting',
          contentType: 'article',
          time: '3 min',
          path: '/guides/account-setup'
        },
        {
          id: 'first-vote',
          title: 'Casting Your First Vote',
          description: 'Step-by-step guide to participating in your first tournament',
          contentType: 'video',
          time: '4 min',
          path: '/videos/first-vote'
        },
        {
          id: 'understanding-tournaments',
          title: 'Understanding Tournaments',
          description: 'Learn about tournament types, rules, and how voting works',
          contentType: 'article',
          time: '6 min',
          path: '/guides/tournaments'
        }
      ]
    },
    {
      id: 'voting-system',
      name: 'Voting System',
      description: 'How to vote and participate in tournaments',
      icon: <Vote className="h-5 w-5" />,
      guides: [
        {
          id: 'how-voting-works',
          title: 'How Voting Works',
          description: 'Understanding the voting process and vote validation',
          contentType: 'article',
          time: '5 min',
          path: '/guides/voting-process'
        },
        {
          id: 'vote-costs',
          title: 'Vote Costs & Wallet Usage',
          description: 'Learn about voting costs and how to manage your wallet',
          contentType: 'article',
          time: '4 min',
          path: '/guides/vote-costs'
        },
        {
          id: 'vote-history',
          title: 'Tracking Your Vote History',
          description: 'View and manage your voting activity',
          contentType: 'tutorial',
          time: '3 min',
          path: '/tutorials/vote-history'
        },
        {
          id: 'real-time-results',
          title: 'Understanding Real-Time Results',
          description: 'How live vote tallying works and when results are final',
          contentType: 'video',
          time: '5 min',
          path: '/videos/results'
        },
        {
          id: 'voting-ethics',
          title: 'Voting Ethics & Fair Play',
          description: 'Community guidelines for responsible voting',
          contentType: 'article',
          time: '4 min',
          path: '/guides/ethics'
        },
        {
          id: 'vote-disputes',
          title: 'Vote Disputes & Resolution',
          description: 'What to do if you believe there\'s an issue with voting',
          contentType: 'article',
          time: '5 min',
          path: '/guides/disputes'
        }
      ]
    },
    {
      id: 'tournaments',
      name: 'Tournaments',
      description: 'Everything about tournament participation',
      icon: <Trophy className="h-5 w-5" />,
      guides: [
        {
          id: 'tournament-types',
          title: 'Tournament Types & Categories',
          description: 'Different types of tournaments and sports categories',
          contentType: 'article',
          time: '5 min',
          path: '/guides/tournament-types'
        },
        {
          id: 'open-vs-closed',
          title: 'Open vs Closed Tournaments',
          description: 'Understanding tournament access and participation',
          contentType: 'article',
          time: '3 min',
          path: '/guides/tournament-access'
        },
        {
          id: 'tournament-templates',
          title: 'Popular Tournament Templates',
          description: 'Explore pre-built tournament formats',
          contentType: 'tutorial',
          time: '4 min',
          path: '/tutorials/templates'
        },
        {
          id: 'tournament-timeline',
          title: 'Tournament Timeline & Deadlines',
          description: 'Understanding voting windows and result announcements',
          contentType: 'article',
          time: '4 min',
          path: '/guides/timeline'
        },
        {
          id: 'winners-prizes',
          title: 'Winners & Prize Distribution',
          description: 'How winners are determined and prizes awarded',
          contentType: 'article',
          time: '5 min',
          path: '/guides/winners'
        }
      ]
    },
    {
      id: 'wallet',
      name: 'Wallet Management',
      description: 'Managing your funds and transactions',
      icon: <Wallet className="h-5 w-5" />,
      guides: [
        {
          id: 'wallet-basics',
          title: 'Wallet Basics',
          description: 'Understanding your SportsHub wallet',
          contentType: 'article',
          time: '3 min',
          path: '/guides/wallet-basics'
        },
        {
          id: 'adding-funds',
          title: 'Adding Funds to Your Wallet',
          description: 'How to top up your wallet balance',
          contentType: 'video',
          time: '4 min',
          path: '/videos/add-funds'
        },
        {
          id: 'transaction-history',
          title: 'Transaction History',
          description: 'View and track your voting transactions',
          contentType: 'article',
          time: '3 min',
          path: '/guides/transactions'
        },
        {
          id: 'refunds-policy',
          title: 'Refunds & Cancellation Policy',
          description: 'Understanding when and how refunds are processed',
          contentType: 'article',
          time: '5 min',
          path: '/guides/refunds'
        }
      ]
    },
    {
      id: 'account-security',
      name: 'Account & Security',
      description: 'Protecting your account and managing settings',
      icon: <Shield className="h-5 w-5" />,
      guides: [
        {
          id: 'profile-management',
          title: 'Managing Your Profile',
          description: 'Update your profile information and preferences',
          contentType: 'article',
          time: '3 min',
          path: '/guides/profile'
        },
        {
          id: 'password-security',
          title: 'Password Security Best Practices',
          description: 'Keep your account secure with strong passwords',
          contentType: 'article',
          time: '4 min',
          path: '/guides/password-security'
        },
        {
          id: 'two-factor-auth',
          title: 'Two-Factor Authentication',
          description: 'Enable 2FA for additional account protection',
          contentType: 'tutorial',
          time: '5 min',
          path: '/tutorials/2fa'
        },
        {
          id: 'privacy-settings',
          title: 'Privacy Settings',
          description: 'Control your data and privacy preferences',
          contentType: 'article',
          time: '4 min',
          path: '/guides/privacy'
        }
      ]
    },
    {
      id: 'community',
      name: 'Community & Support',
      description: 'Connect with other users and get help',
      icon: <Users className="h-5 w-5" />,
      guides: [
        {
          id: 'community-guidelines',
          title: 'Community Guidelines',
          description: 'Rules and standards for SportsHub community members',
          contentType: 'article',
          time: '6 min',
          path: '/guides/community-guidelines'
        },
        {
          id: 'contact-support',
          title: 'Contacting Support',
          description: 'How to get help from our support team',
          contentType: 'article',
          time: '3 min',
          path: '/guides/contact-support'
        },
        {
          id: 'reporting-issues',
          title: 'Reporting Issues',
          description: 'Report bugs, abuse, or suspicious activity',
          contentType: 'article',
          time: '4 min',
          path: '/guides/reporting'
        }
      ]
    }
  ];
  
  // Filter guides based on search query
  const filteredCategories = searchQuery 
    ? guideCategories.map(category => ({
        ...category,
        guides: category.guides.filter(guide =>
          guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guide.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.guides.length > 0)
    : guideCategories;

  const getContentIcon = (type: Guide['contentType']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'tutorial':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Help Center</CardTitle>
            <CardDescription>Find guides, tutorials, and answers to your questions</CardDescription>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search for help articles..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="guides" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="guides" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Guides & Tutorials</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Video className="mr-2 h-4 w-4" />
              <span>Video Tutorials</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Guides & Articles Tab */}
          <TabsContent value="guides">
            {filteredCategories.length > 0 ? (
              <div className="space-y-6">
                {filteredCategories.map((category) => (
                  <div key={category.id}>
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {category.guides.map((guide) => (
                        <motion.div
                          key={guide.id}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center text-muted-foreground">
                                  {getContentIcon(guide.contentType)}
                                  <span className="ml-2 text-xs uppercase">{guide.contentType}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {guide.time}
                                </div>
                              </div>
                              <h4 className="font-medium mb-2 line-clamp-2">{guide.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {guide.description}
                              </p>
                              <div className="flex items-center text-primary text-sm font-medium">
                                Read More <ChevronRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No articles found matching "{searchQuery}"</p>
                <Button variant="link" onClick={() => setSearchQuery("")}>Clear search</Button>
              </div>
            )}
          </TabsContent>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How do I cast a vote?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    To cast a vote, navigate to an active tournament, select your preferred option, 
                    ensure you have sufficient wallet balance, and click "Submit Vote". Your vote 
                    will be recorded immediately and cannot be changed once submitted.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Can I change my vote after submission?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No, votes are immutable once submitted. This ensures the integrity of the voting 
                    process and creates an audit trail. Please review your selection carefully before 
                    confirming your vote.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How much does voting cost?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Each vote typically costs 1 credit from your wallet balance. Tournament organizers 
                    may set different vote costs for special tournaments. You can check the vote cost 
                    before submitting on the tournament page.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">When are tournament results announced?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Results are visible in real-time during the voting period with a "LIVE" indicator. 
                    Final results are announced when the tournament organizer closes the tournament, 
                    typically after the voting deadline. You'll receive an in-app notification when 
                    results are finalized.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How do I add funds to my wallet?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Go to your Dashboard, click on "Wallet" or the balance display, and select "Top Up". 
                    Enter the amount you wish to add and complete the transaction. Funds are typically 
                    available immediately after successful payment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Can I get a refund for my vote?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Refunds are only available in specific circumstances, such as tournament cancellation 
                    by the organizer or technical errors. Standard votes cannot be refunded once cast. 
                    Contact support if you believe you're eligible for a refund.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Is my vote anonymous?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your specific vote choice is recorded securely but not publicly displayed. Only 
                    aggregated vote counts are shown to maintain voter privacy while ensuring 
                    transparency in results. Your vote history is visible only to you in your account.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What if I suspect vote manipulation?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We have robust anti-fraud measures including rate limiting (10 votes per minute) 
                    and audit logging. If you suspect manipulation, use the "Report Issue" feature 
                    on the tournament page or contact support immediately with specific details.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How do I enable two-factor authentication?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Go to Dashboard → Settings → Security. Click "Enable 2FA" and follow the 
                    setup instructions using an authenticator app like Google Authenticator or Authy. 
                    This adds an extra layer of security to your account.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Where can I view my voting history?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Navigate to Dashboard → Vote History to see all your past votes, including 
                    tournament names, options selected, vote costs, and timestamps. You can filter 
                    by date or tournament to find specific votes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What sports categories are available?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    SportsHub currently supports tournaments for Football, Rugby, Cricket, Basketball, 
                    Tennis, and other popular sports. Tournament organizers can create custom categories 
                    as well. Check the tournaments page to see all active categories.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How do I contact support?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You can reach our support team by clicking the "Contact Support" button at the 
                    bottom of this page, emailing support@sportshub.com, or accessing the support 
                    portal from your dashboard. We typically respond within 24 hours.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Video Tutorials Tab */}
          <TabsContent value="videos">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Getting Started with SportsHub</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      A complete walkthrough for new users
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      5:30
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">How to Cast Your First Vote</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Step-by-step voting tutorial
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      4:15
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Managing Your Wallet</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add funds and track transactions
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      3:45
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Understanding Tournament Results</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      How real-time tallying works
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      5:00
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Security Best Practices</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Protect your account with 2FA
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      6:20
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Tournament Types Explained</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Open vs closed tournaments
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      4:50
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Contact Support Section */}
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Still need help?</h3>
              <p className="text-sm text-muted-foreground">Our support team is ready to assist you</p>
            </div>
            <Button className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Contact Support</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { HelpCenter };
