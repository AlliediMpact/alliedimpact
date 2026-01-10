'use client';

import { useState } from 'react';
import { FileText, Download, Save, Eye, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    description: string;
  }>;
  skills: string[];
}

export default function ResumeBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: []
  });

  const steps = [
    { id: 1, name: 'Template', icon: Eye },
    { id: 2, name: 'Personal Info', icon: FileText },
    { id: 3, name: 'Experience', icon: FileText },
    { id: 4, name: 'Education', icon: FileText },
    { id: 5, name: 'Skills', icon: FileText }
  ];

  const templates = [
    { id: 'modern' as const, name: 'Modern', description: 'Clean and contemporary design' },
    { id: 'classic' as const, name: 'Classic', description: 'Traditional professional format' },
    { id: 'minimal' as const, name: 'Minimal', description: 'Simple and elegant layout' }
  ];

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now().toString(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          degree: '',
          institution: '',
          location: '',
          graduationDate: '',
          description: ''
        }
      ]
    }));
  };

  const [skillInput, setSkillInput] = useState('');
  
  const addSkill = () => {
    if (skillInput.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleExportPDF = () => {
    alert('PDF export functionality will be implemented with a PDF generation library');
  };

  const handleSave = () => {
    alert('Resume saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Resume Builder
          </h1>
          <p className="text-gray-600 mt-2">
            Create a professional resume in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Build Your Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          isCurrent ? 'bg-white/20' : isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`}>
                          {isCompleted ? (
                            <Check className="h-4 w-4 text-white" />
                          ) : (
                            <span className={`text-sm font-semibold ${isCurrent ? 'text-white' : 'text-gray-600'}`}>
                              {step.id}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{step.name}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  <Button onClick={handleSave} variant="outline" className="w-full flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleExportPDF} className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose a Template</CardTitle>
                  <CardDescription>Select a design that fits your style</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-6 border-2 rounded-lg text-left transition-all ${
                          selectedTemplate === template.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-32 mb-4 rounded ${
                          template.id === 'modern' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' :
                          template.id === 'classic' ? 'bg-gradient-to-br from-gray-700 to-gray-900' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`} />
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        {selectedTemplate === template.id && (
                          <Badge variant="success" className="mt-2">Selected</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setCurrentStep(2)} className="flex items-center gap-2">
                      Next: Personal Info
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Tell us about yourself</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <Input
                          value={resumeData.personal.fullName}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, fullName: e.target.value }
                          }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <Input
                          type="email"
                          value={resumeData.personal.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, email: e.target.value }
                          }))}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <Input
                          value={resumeData.personal.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, phone: e.target.value }
                          }))}
                          placeholder="+27 123 456 7890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <Input
                          value={resumeData.personal.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, location: e.target.value }
                          }))}
                          placeholder="Johannesburg, South Africa"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                      <textarea
                        value={resumeData.personal.summary}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, summary: e.target.value }
                        }))}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="A brief summary of your professional background and career goals..."
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} className="flex items-center gap-2">
                      Next: Experience
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Experience */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Add your work history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resumeData.experience.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-600 mb-4">No experience added yet</p>
                        <Button onClick={addExperience} variant="outline">
                          Add Your First Position
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={addExperience} variant="outline" className="w-full">
                        + Add Another Position
                      </Button>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(4)} className="flex items-center gap-2">
                      Next: Education
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Education */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Add your educational background</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resumeData.education.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-600 mb-4">No education added yet</p>
                        <Button onClick={addEducation} variant="outline">
                          Add Your First Degree
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={addEducation} variant="outline" className="w-full">
                        + Add Another Degree
                      </Button>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(5)} className="flex items-center gap-2">
                      Next: Skills
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Skills */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Add your key skills and competencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="e.g., React, TypeScript, Project Management"
                      />
                      <Button onClick={addSkill}>Add</Button>
                    </div>
                    
                    {resumeData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-lg">
                        {resumeData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 text-gray-500 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(4)}>
                      Back
                    </Button>
                    <Button onClick={handleExportPDF} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4" />
                      Finish & Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
