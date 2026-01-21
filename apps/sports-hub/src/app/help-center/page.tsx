import HelpCenter from "@/components/HelpCenter";

export const metadata = {
  title: 'Help Center',
  description: 'Find answers, guides, and tutorials for SportsHub platform',
};

export default function HelpCenterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HelpCenter />
    </div>
  );
}
