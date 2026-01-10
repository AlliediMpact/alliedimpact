'use client';

import { Star, ThumbsUp, ThumbsDown, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface Review {
  id: string;
  author: string;
  position: string;
  rating: number;
  date: string;
  title: string;
  pros: string;
  cons: string;
  helpful: number;
  notHelpful: number;
}

interface CompanyReviewsSectionProps {
  companyId: string;
  companyName: string;
}

export function CompanyReviewsSection({ companyId, companyName }: CompanyReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    position: '',
    title: '',
    pros: '',
    cons: ''
  });

  // Mock reviews - TODO: Replace with Firebase data
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      author: 'Former Employee',
      position: 'Software Engineer',
      rating: 4,
      date: '2026-01-05',
      title: 'Great place to grow your career',
      pros: 'Excellent learning opportunities, supportive team, modern tech stack',
      cons: 'Fast-paced environment can be stressful at times',
      helpful: 15,
      notHelpful: 2
    },
    {
      id: '2',
      author: 'Current Employee',
      position: 'Senior Developer',
      rating: 5,
      date: '2025-12-20',
      title: 'Best company I\'ve worked for',
      pros: 'Amazing culture, competitive salary, work-life balance, remote flexibility',
      cons: 'Office location could be more central',
      helpful: 23,
      notHelpful: 1
    },
    {
      id: '3',
      author: 'Former Employee',
      position: 'Product Manager',
      rating: 3,
      date: '2025-11-15',
      title: 'Mixed experience',
      pros: 'Good benefits package, interesting projects',
      cons: 'Limited career advancement opportunities, bureaucratic processes',
      helpful: 8,
      notHelpful: 5
    }
  ]);

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const handleSubmitReview = () => {
    if (rating === 0 || !formData.title || !formData.pros) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Review submitted successfully! It will be published after moderation.');
    setShowReviewForm(false);
    // Reset form
    setRating(0);
    setFormData({ position: '', title: '', pros: '', cons: '' });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Company Reviews
            </CardTitle>
            <Button onClick={() => setShowReviewForm(!showReviewForm)} size="sm">
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= averageRating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = (count / reviews.length) * 100;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Write Your Review</h3>
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Position *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summarize your experience"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Pros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pros *
                  </label>
                  <textarea
                    value={formData.pros}
                    onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                    rows={3}
                    placeholder="What did you like about working here?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Cons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cons
                  </label>
                  <textarea
                    value={formData.cons}
                    onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                    rows={3}
                    placeholder="What could be improved?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleSubmitReview} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Submit Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.author}</span>
                      <Badge variant="secondary" className="text-xs">{review.position}</Badge>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm font-medium text-green-700">Pros:</span>
                    <p className="text-sm text-gray-700">{review.pros}</p>
                  </div>
                  {review.cons && (
                    <div>
                      <span className="text-sm font-medium text-red-700">Cons:</span>
                      <p className="text-sm text-gray-700">{review.cons}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                    {review.helpful}
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
                    <ThumbsDown className="h-4 w-4" />
                    {review.notHelpful}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
