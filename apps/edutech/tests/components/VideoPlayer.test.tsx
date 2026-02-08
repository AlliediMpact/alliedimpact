/**
 * Tests for VideoPlayer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoPlayer from '../../src/components/learn/VideoPlayer';

// Mock video element methods
const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockRequestFullscreen = jest.fn();

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: mockPlay,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: mockPause,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'requestFullscreen', {
    configurable: true,
    value: mockRequestFullscreen,
  });
});

describe('VideoPlayer', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockPause.mockResolvedValue(undefined);
    mockRequestFullscreen.mockResolvedValue(undefined);
  });

  describe('YouTube video rendering', () => {
    it('should render YouTube iframe for YouTube URLs', () => {
      render(
        <VideoPlayer
          videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          onComplete={mockOnComplete}
        />
      );

      const iframe = screen.getByTitle(/youtube/i);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        'src',
        expect.stringContaining('youtube.com/embed/dQw4w9WgXcQ')
      );
    });

    it('should render YouTube iframe for youtu.be URLs', () => {
      render(
        <VideoPlayer
          videoUrl="https://youtu.be/dQw4w9WgXcQ"
          onComplete={mockOnComplete}
        />
      );

      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });

    it('should have correct iframe attributes', () => {
      render(
        <VideoPlayer
          videoUrl="https://www.youtube.com/watch?v=test123"
          onComplete={mockOnComplete}
        />
      );

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('allowFullScreen');
      expect(iframe).toHaveAttribute(
        'allow',
        expect.stringContaining('autoplay')
      );
    });

    it('should extract video ID from URL with parameters', () => {
      render(
        <VideoPlayer
          videoUrl="https://www.youtube.com/watch?v=abc123&t=10s&list=playlist"
          onComplete={mockOnComplete}
        />
      );

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute(
        'src',
        expect.stringContaining('youtube.com/embed/abc123')
      );
    });
  });

  describe('native video rendering', () => {
    it('should render video element for non-YouTube URLs', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', '/videos/lesson1.mp4');
    });

    it('should have correct video attributes', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video');
      expect(video).toHaveAttribute('controls');
      expect(video).toHaveClass('w-full', 'h-full');
    });
  });

  describe('play/pause functionality', () => {
    it('should play video when play button is clicked', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const playButton = screen.getByLabelText(/play/i);
      fireEvent.click(playButton);

      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('should pause video when pause button is clicked', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const playButton = screen.getByLabelText(/play/i);
      fireEvent.click(playButton); // Start playing

      const pauseButton = screen.getByLabelText(/pause/i);
      fireEvent.click(pauseButton);

      expect(mockPause).toHaveBeenCalledTimes(1);
    });

    it('should toggle play/pause on repeated clicks', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const playButton = screen.getByLabelText(/play/i);
      
      fireEvent.click(playButton); // Play
      expect(mockPlay).toHaveBeenCalledTimes(1);

      const pauseButton = screen.getByLabelText(/pause/i);
      fireEvent.click(pauseButton); // Pause
      expect(mockPause).toHaveBeenCalledTimes(1);

      const playButton2 = screen.getByLabelText(/play/i);
      fireEvent.click(playButton2); // Play again
      expect(mockPlay).toHaveBeenCalledTimes(2);
    });
  });

  describe('mute functionality', () => {
    it('should mute video when mute button is clicked', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const muteButton = screen.getByLabelText(/mute/i);
      fireEvent.click(muteButton);

      const video = document.querySelector('video');
      expect(video).toHaveProperty('muted', true);
    });

    it('should unmute video when unmute button is clicked', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const muteButton = screen.getByLabelText(/mute/i);
      fireEvent.click(muteButton); // Mute

      const unmuteButton = screen.getByLabelText(/unmute/i);
      fireEvent.click(unmuteButton); // Unmute

      const video = document.querySelector('video');
      expect(video).toHaveProperty('muted', false);
    });

    it('should toggle mute/unmute on repeated clicks', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;

      const muteButton = screen.getByLabelText(/mute/i);
      fireEvent.click(muteButton);
      expect(video.muted).toBe(true);

      const unmuteButton = screen.getByLabelText(/unmute/i);
      fireEvent.click(unmuteButton);
      expect(video.muted).toBe(false);
    });
  });

  describe('progress tracking', () => {
    it('should update progress as video plays', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;

      // Simulate video metadata loaded
      Object.defineProperty(video, 'duration', { value: 100, configurable: true });
      fireEvent.loadedMetadata(video);

      // Simulate video progress
      Object.defineProperty(video, 'currentTime', { value: 50, configurable: true });
      fireEvent.timeUpdate(video);

      // Progress bar should reflect 50%
      const progressBar = document.querySelector('input[type="range"]') as HTMLInputElement;
      expect(progressBar).toHaveValue('50');
    });

    it('should call onComplete when video reaches 90%', async () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;

      // Simulate video metadata
      Object.defineProperty(video, 'duration', { value: 100, configurable: true });
      fireEvent.loadedMetadata(video);

      // Simulate video progress to 90%
      Object.defineProperty(video, 'currentTime', { value: 90, configurable: true });
      fireEvent.timeUpdate(video);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should only call onComplete once', async () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;

      Object.defineProperty(video, 'duration', { value: 100, configurable: true });
      fireEvent.loadedMetadata(video);

      // Multiple updates past 90%
      Object.defineProperty(video, 'currentTime', { value: 90, configurable: true });
      fireEvent.timeUpdate(video);

      Object.defineProperty(video, 'currentTime', { value: 95, configurable: true });
      fireEvent.timeUpdate(video);

      Object.defineProperty(video, 'currentTime', { value: 100, configurable: true });
      fireEvent.timeUpdate(video);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onComplete before 90%', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;

      Object.defineProperty(video, 'duration', { value: 100, configurable: true });
      fireEvent.loadedMetadata(video);

      // Progress to 85% (below threshold)
      Object.defineProperty(video, 'currentTime', { value: 85, configurable: true });
      fireEvent.timeUpdate(video);

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('seeking', () => {
    it('should seek to specified time', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;
      Object.defineProperty(video, 'duration', { value: 100, configurable: true });
      fireEvent.loadedMetadata(video);

      const progressBar = document.querySelector('input[type="range"]') as HTMLInputElement;
      fireEvent.change(progressBar, { target: { value: '75' } });

      expect(video.currentTime).toBe(75);
    });

    it('should update progress bar when seeking', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;
      Object.defineProperty(video, 'duration', { value: 200, configurable: true });
      fireEvent.loadedMetadata(video);

      const progressBar = document.querySelector('input[type="range"]') as HTMLInputElement;
      fireEvent.change(progressBar, { target: { value: '50' } });

      expect(video.currentTime).toBe(100); // 50% of 200
    });
  });

  describe('fullscreen', () => {
    it('should request fullscreen when fullscreen button is clicked', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const fullscreenButton = screen.getByLabelText(/fullscreen/i);
      fireEvent.click(fullscreenButton);

      expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
    });
  });

  describe('time formatting', () => {
    it('should display formatted current time', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;

      Object.defineProperty(video, 'duration', { value: 300, configurable: true });
      fireEvent.loadedMetadata(video);

      Object.defineProperty(video, 'currentTime', { value: 125, configurable: true });
      fireEvent.timeUpdate(video);

      expect(screen.getByText(/2:05/)).toBeInTheDocument(); // 125 seconds = 2:05
    });

    it('should display formatted duration', () => {
      render(
        <VideoPlayer
          videoUrl="/videos/lesson1.mp4"
          onComplete={mockOnComplete}
        />
      );

      const video = document.querySelector('video') as HTMLVideoElement;

      Object.defineProperty(video, 'duration', { value: 320, configurable: true });
      fireEvent.loadedMetadata(video);

      expect(screen.getByText(/5:20/)).toBeInTheDocument(); // 320 seconds = 5:20
    });
  });

  describe('edge cases', () => {
    it('should handle video without onComplete callback', () => {
      render(<VideoPlayer videoUrl="/videos/lesson1.mp4" />);

      const video = document.querySelector('video') as HTMLVideoElement;

      Object.defineProperty(video, 'duration', { value: 100, configurable: true });
      fireEvent.loadedMetadata(video);

      Object.defineProperty(video, 'currentTime', { value: 95, configurable: true });

      expect(() => {
        fireEvent.timeUpdate(video);
      }).not.toThrow();
    });

    it('should handle empty video URL', () => {
      expect(() => {
        render(<VideoPlayer videoUrl="" />);
      }).not.toThrow();
    });

    it('should handle invalid YouTube URL', () => {
      render(
        <VideoPlayer
          videoUrl="https://www.youtube.com/watch?v="
          onComplete={mockOnComplete}
        />
      );

      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });
  });
});
