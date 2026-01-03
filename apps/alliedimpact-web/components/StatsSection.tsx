'use client';

export default function StatsSection() {
  const stats = [
    {
      value: '10,000+',
      label: 'Active Users',
      description: 'Trust Allied iMpact',
    },
    {
      value: 'R50M+',
      label: 'Total Transactions',
      description: 'Processed securely',
    },
    {
      value: '5',
      label: 'Products',
      description: 'One platform',
    },
    {
      value: '99.9%',
      label: 'Uptime',
      description: 'Always available',
    },
  ];

  return (
    <section className="w-full py-20 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="text-lg font-semibold">
                {stat.label}
              </div>
              <div className="text-sm text-white/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
