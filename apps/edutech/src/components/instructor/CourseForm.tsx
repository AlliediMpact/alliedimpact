'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { Button } from '@allied-impact/ui';
import { Save, Eye } from 'lucide-react';

interface CourseFormProps {
  mode?: 'create' | 'edit';
  onSaveDraft?: (courseData: Partial<Course>) => Promise<void>;
  onPublish?: (courseData: Partial<Course>) => Promise<void>;
  loading?: boolean;
  course?: Partial<Course>;
}

export default function CourseForm({
  mode = 'create',
  onSaveDraft,
  onPublish,
  loading = false,
  course = {},
}: CourseFormProps) {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: course.title || '',
    description: course.description || '',
    shortDescription: course.shortDescription || '',
    track: course.track || 'computer-skills',
    level: course.level || 'beginner',
    estimatedHours: course.estimatedHours || 10,
    tags: course.tags || [],
    ...course,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Course title is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Course description is required';
    }
    if (!formData.shortDescription?.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }
    if (!formData.estimatedHours || formData.estimatedHours < 1) {
      newErrors.estimatedHours = 'Estimated hours must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSaveDraft) {
      await onSaveDraft(formData);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }

    if (onPublish) {
      await onPublish(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Course Title</label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter course title"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Course Track */}
      <div>
        <label className="block text-sm font-medium mb-2">Track</label>
        <select
          value={formData.track || ''}
          onChange={(e) => handleChange('track', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="computer-skills">Computer Skills</option>
          <option value="coding">Coding</option>
        </select>
      </div>

      {/* Course Level */}
      <div>
        <label className="block text-sm font-medium mb-2">Level</label>
        <select
          value={formData.level || ''}
          onChange={(e) => handleChange('level', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter detailed course description"
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Short Description</label>
        <textarea
          value={formData.shortDescription || ''}
          onChange={(e) => handleChange('shortDescription', e.target.value)}
          placeholder="Brief summary of the course"
          rows={2}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.shortDescription ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
      </div>

      {/* Estimated Hours */}
      <div>
        <label className="block text-sm font-medium mb-2">Estimated Hours</label>
        <input
          type="number"
          value={formData.estimatedHours || ''}
          onChange={(e) => handleChange('estimatedHours', parseInt(e.target.value))}
          placeholder="Number of hours"
          min="1"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.estimatedHours && <p className="text-red-500 text-sm mt-1">{errors.estimatedHours}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Draft'}
        </Button>
        {onPublish && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePublish}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Publish
          </Button>
        )}
      </div>
    </form>
  );
}
