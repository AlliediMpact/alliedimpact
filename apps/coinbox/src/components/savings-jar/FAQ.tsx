'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqs = [
  {
    id: '1',
    question: 'What is the Savings Jar?',
    answer: 'The Savings Jar is an automatic savings feature that helps you save money effortlessly. When you receive P2P payments, a portion is automatically set aside into your savings jar based on your threshold settings.',
  },
  {
    id: '2',
    question: 'How does automatic saving work?',
    answer: 'When a P2P payment lands in your wallet and the amount exceeds your set threshold (default R100), the excess is automatically transferred to your Savings Jar. For example, if your threshold is R100 and you receive R150, then R50 goes into savings.',
  },
  {
    id: '3',
    question: 'Can I manually add money to my Savings Jar?',
    answer: 'Yes! You can manually deposit money from your main wallet to your Savings Jar at any time. Just use the deposit form on your Savings Jar dashboard.',
  },
  {
    id: '4',
    question: 'Is there a fee for withdrawals?',
    answer: 'Yes, there is a 1% withdrawal fee. This small fee helps maintain the platform and encourages you to save longer. The fee is deducted from your withdrawal amount.',
  },
  {
    id: '5',
    question: 'How do I withdraw from my Savings Jar?',
    answer: 'To withdraw, go to your Savings Jar dashboard, enter the amount you want to withdraw, and confirm. The money (minus the 1% fee) will be transferred back to your main wallet immediately.',
  },
  {
    id: '6',
    question: 'What is the auto-save threshold?',
    answer: 'The auto-save threshold is the minimum amount that must remain in your wallet after a P2P payment. Any excess above this amount is automatically saved. You can adjust this threshold in your settings.',
  },
  {
    id: '7',
    question: 'Can I disable automatic saving?',
    answer: 'Yes, you can adjust your threshold to a very high amount (e.g., R10,000) to effectively disable automatic saving while still being able to manually deposit.',
  },
  {
    id: '8',
    question: 'Is my money safe in the Savings Jar?',
    answer: 'Yes, your savings are stored securely in Firebase Firestore with bank-level security. All transactions are logged and auditable.',
  },
  {
    id: '9',
    question: 'Can I see my savings history?',
    answer: 'Yes! Your Savings Jar dashboard shows all your deposits and withdrawals with timestamps. You can also view analytics to track your savings trends over time.',
  },
  {
    id: '10',
    question: 'What happens if I withdraw more than my balance?',
    answer: 'You cannot withdraw more than your current balance. The system will prevent overdrafts and show an error message.',
  },
  {
    id: '11',
    question: 'How is the 1% fee calculated?',
    answer: 'The fee is calculated as 1% of your withdrawal amount. For example, if you withdraw R100, the fee is R1, and you receive R99 in your wallet. The fee is always rounded to 2 decimal places.',
  },
  {
    id: '12',
    question: 'Can I have multiple Savings Jars?',
    answer: 'Currently, each user has one Savings Jar. This simplifies tracking and helps you focus on a single savings goal. Future updates may introduce multiple jars for different goals.',
  },
  {
    id: '13',
    question: 'What if I encounter an error?',
    answer: 'If you experience any issues, contact our support team. All transactions are logged, so we can investigate and resolve any problems quickly.',
  },
  {
    id: '14',
    question: 'Does my Savings Jar earn interest?',
    answer: 'Currently, the Savings Jar does not earn interest. It is designed as a simple, secure place to store your savings. Interest-bearing accounts may be introduced in future updates.',
  },
  {
    id: '15',
    question: 'How do I view my analytics?',
    answer: 'Navigate to the Analytics tab on your Savings Jar dashboard to see charts and insights about your saving patterns, including deposit trends, withdrawal patterns, and savings rate.',
  },
];

export default function SavingsJarFAQ() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
