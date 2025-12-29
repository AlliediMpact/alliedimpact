'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import { Moon, Sun, Monitor, Bell, Globe, Shield, Palette, Volume2 } from 'lucide-react';

interface PreferenceOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface PreferenceSection {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  settings: PreferenceSetting[];
}

interface PreferenceSetting {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'radio' | 'slider';
  value: any;
  options?: PreferenceOption[];
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: any) => void;
}

// Toggle switch
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  className,
}: ToggleSwitchProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <motion.span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          animate={{ x: enabled ? 24 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

// Radio group
interface RadioGroupProps {
  options: PreferenceOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function RadioGroup({ options, value, onChange, label, className }: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left',
              value === option.value
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                value === option.value
                  ? 'border-purple-600'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              {value === option.value && (
                <motion.div
                  className="w-3 h-3 rounded-full bg-purple-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                />
              )}
            </div>
            {option.icon && <div className="text-gray-600 dark:text-gray-400">{option.icon}</div>}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
              {option.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Slider
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
        )}
        {showValue && (
          <span className="text-sm font-medium text-purple-600">{value}</span>
        )}
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.2 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-lg cursor-pointer"
          style={{ left: `${percentage}%`, x: '-50%' }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      </div>
    </div>
  );
}

// Theme selector
export function ThemeSelector() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const options: PreferenceOption[] = [
    { value: 'light', label: 'Light', icon: <Sun size={20} />, description: 'Light theme' },
    { value: 'dark', label: 'Dark', icon: <Moon size={20} />, description: 'Dark theme' },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor size={20} />,
      description: 'Follow system preference',
    },
  ];

  return <RadioGroup options={options} value={theme} onChange={applyTheme} label="Appearance" />;
}

// Preferences panel
interface PreferencesPanelProps {
  sections: PreferenceSection[];
  className?: string;
}

export function PreferencesPanel({ sections, className }: PreferencesPanelProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className={cn('flex gap-6', className)}>
      {/* Sidebar */}
      <div className="w-64 space-y-1">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
              activeSection === section.id
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {section.icon}
            <div className="flex-1">
              <p className="font-medium">{section.title}</p>
              {section.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{section.description}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {currentSection && (
          <motion.div
            key={currentSection.id}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentSection.title}
              </h2>
              {currentSection.description && (
                <p className="text-gray-600 dark:text-gray-400">{currentSection.description}</p>
              )}
            </div>

            <div className="space-y-6">
              {currentSection.settings.map((setting) => (
                <div
                  key={setting.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  {setting.type === 'toggle' && (
                    <ToggleSwitch
                      enabled={setting.value}
                      onChange={setting.onChange}
                      label={setting.label}
                      description={setting.description}
                    />
                  )}
                  {setting.type === 'radio' && setting.options && (
                    <RadioGroup
                      options={setting.options}
                      value={setting.value}
                      onChange={setting.onChange}
                      label={setting.label}
                    />
                  )}
                  {setting.type === 'slider' && (
                    <Slider
                      value={setting.value}
                      onChange={setting.onChange}
                      min={setting.min}
                      max={setting.max}
                      step={setting.step}
                      label={setting.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Quick preferences - compact version
export function QuickPreferences() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white">Quick Settings</h3>

      <div className="space-y-3">
        <ToggleSwitch
          enabled={notifications}
          onChange={setNotifications}
          label="Notifications"
          description="Receive notifications"
        />
        <ToggleSwitch enabled={sound} onChange={setSound} label="Sound" description="Enable sound effects" />

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex-1 p-3 rounded-lg border-2 transition-colors',
                theme === 'light'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <Sun size={20} className="mx-auto" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex-1 p-3 rounded-lg border-2 transition-colors',
                theme === 'dark'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <Moon size={20} className="mx-auto" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'flex-1 p-3 rounded-lg border-2 transition-colors',
                theme === 'system'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <Monitor size={20} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
