import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Journey,
  Question,
  JourneyAttempt,
  GameState,
  AnswerResult,
  JourneyResult,
  EventResult,
  MASTERY_THRESHOLDS,
  CREDIT_RULES,
  Stage,
} from '@/lib/types/game';
import { MasteryService } from './MasteryService';

/**
 * Game Engine Service
 * Orchestrates journey-based learning gameplay
 */
export class GameEngine {
  private gameState: GameState | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Start a new journey
   */
  async startJourney(journeyId: string, carType: string): Promise<GameState> {
    // Load journey definition
    const journey = await this.loadJourney(journeyId);
    if (!journey) {
      throw new Error('Journey not found');
    }

    // Initialize game state
    this.gameState = {
      journeyId,
      journey,
      carType,
      currentEventIndex: 0,
      currentEvent: journey.events[0] || null,
      currentQuestion: null,
      events: [],
      startedAt: new Date(),
      isPaused: false,
      checkpointId: null,
    };

    // Load first question
    if (this.gameState.currentEvent) {
      this.gameState.currentQuestion = await this.loadRandomQuestion(
        this.gameState.currentEvent.questionIds,
        journey.stage
      );
    }

    return this.gameState;
  }

  /**
   * Load journey from Firestore
   */
  async loadJourney(journeyId: string): Promise<Journey | null> {
    try {
      const journeyDoc = await getDoc(
        doc(db, 'drivemaster_journeys', journeyId)
      );

      if (!journeyDoc.exists()) {
        return null;
      }

      const data = journeyDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Journey;
    } catch (error) {
      console.error('Error loading journey:', error);
      return null;
    }
  }

  /**
   * Get journeys by stage
   */
  async getJourneysByStage(stage: Stage): Promise<Journey[]> {
    try {
      const journeysQuery = query(
        collection(db, 'drivemaster_journeys'),
        where('stage', '==', stage),
        where('isPublished', '==', true)
      );

      const snapshot = await getDocs(journeysQuery);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Journey;
      });
    } catch (error) {
      console.error('Error fetching journeys:', error);
      return [];
    }
  }

  /**
   * Load random question from pool
   */
  async loadRandomQuestion(
    questionIds: string[],
    stage: Stage
  ): Promise<Question | null> {
    try {
      // If specific question IDs provided, pick one randomly
      if (questionIds.length > 0) {
        const randomId = questionIds[Math.floor(Math.random() * questionIds.length)];
        const questionDoc = await getDoc(
          doc(db, 'drivemaster_questions', randomId)
        );

        if (questionDoc.exists()) {
          const data = questionDoc.data();
          return {
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as Question;
        }
      }

      // Fallback: get any question for this stage
      const questionsQuery = query(
        collection(db, 'drivemaster_questions'),
        where('stage', '==', stage),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(questionsQuery);
      if (snapshot.empty) return null;

      const questions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Question;
      });

      return questions[Math.floor(Math.random() * questions.length)];
    } catch (error) {
      console.error('Error loading question:', error);
      return null;
    }
  }

  /**
   * Validate answer and provide feedback
   */
  async validateAnswer(
    questionId: string,
    selectedOptionId: string,
    timeToAnswer: number
  ): Promise<AnswerResult> {
    if (!this.gameState || !this.gameState.currentQuestion) {
      throw new Error('No active game state');
    }

    const question = this.gameState.currentQuestion;
    const correctOption = question.options.find((opt) => opt.isCorrect);

    if (!correctOption) {
      throw new Error('Question has no correct answer');
    }

    const isCorrect = selectedOptionId === correctOption.id;
    const creditsAwarded = isCorrect
      ? CREDIT_RULES.earn.correctAnswer
      : -CREDIT_RULES.lose.incorrectAnswer;

    // Record event result
    const eventResult: EventResult = {
      eventId: this.gameState.currentEvent!.eventId,
      eventType: this.gameState.currentEvent!.type,
      questionId,
      answerId: selectedOptionId,
      isCorrect,
      timeToAnswer,
    };

    this.gameState.events.push(eventResult);

    return {
      isCorrect,
      correctOptionId: correctOption.id,
      explanation: question.explanation,
      creditsAwarded,
      timeToAnswer,
    };
  }

  /**
   * Advance to next event/question
   */
  async advanceJourney(): Promise<boolean> {
    if (!this.gameState) {
      throw new Error('No active game state');
    }

    // Move to next event
    this.gameState.currentEventIndex++;

    // Check if journey is complete
    if (this.gameState.currentEventIndex >= this.gameState.journey.events.length) {
      return false; // Journey complete
    }

    // Load next event and question
    this.gameState.currentEvent =
      this.gameState.journey.events[this.gameState.currentEventIndex];

    this.gameState.currentQuestion = await this.loadRandomQuestion(
      this.gameState.currentEvent.questionIds,
      this.gameState.journey.stage
    );

    return true; // More events remaining
  }

  /**
   * End journey and calculate results
   */
  async endJourney(): Promise<JourneyResult> {
    if (!this.gameState) {
      throw new Error('No active game state');
    }

    const duration = Math.floor(
      (new Date().getTime() - this.gameState.startedAt.getTime()) / 1000
    );

    const totalQuestions = this.gameState.events.length;
    const correctAnswers = this.gameState.events.filter((e) => e.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Check if passed based on mastery threshold
    const threshold = MASTERY_THRESHOLDS[this.gameState.journey.stage];
    const passed = score >= threshold.min && score <= threshold.max;

    // Calculate credits earned
    let creditsEarned = 0;
    this.gameState.events.forEach((event) => {
      creditsEarned += event.isCorrect
        ? CREDIT_RULES.earn.correctAnswer
        : -CREDIT_RULES.lose.incorrectAnswer;
    });

    // Bonus for perfect journey
    if (score === 100) {
      creditsEarned += CREDIT_RULES.earn.perfectJourney;
    }

    const result: JourneyResult = {
      journeyId: this.gameState.journeyId,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      passed,
      canAdvance: passed,
      feedback: passed
        ? `Excellent! You scored ${score.toFixed(1)}% and passed the ${threshold.min}% threshold.`
        : `You scored ${score.toFixed(1)}%, which is below the ${threshold.min}% threshold. Journey will restart with new questions.`,
      creditsEarned,
      duration,
      events: this.gameState.events,
    };

    // Save attempt to Firestore
    await this.saveJourneyAttempt(result);

    // Clear game state
    this.gameState = null;

    return result;
  }

  /**
   * Save journey attempt to Firestore
   */
  private async saveJourneyAttempt(result: JourneyResult): Promise<void> {
    if (!this.gameState) return;

    try {
      // Get attempt number
      const progressRef = collection(
        db,
        `drivemaster_users/${this.userId}/progress`
      );
      const attemptsSnapshot = await getDocs(
        query(progressRef, where('journeyId', '==', result.journeyId))
      );
      const attemptNumber = attemptsSnapshot.size + 1;

      // Create attempt record
      const attempt: Omit<JourneyAttempt, 'journeyAttemptId'> = {
        journeyId: result.journeyId,
        stage: this.gameState.journey.stage,
        attemptNumber,
        startedAt: this.gameState.startedAt,
        completedAt: new Date(),
        duration: result.duration,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        score: result.score,
        passed: result.passed,
        events: result.events,
        carType: this.gameState.carType,
        routeId: this.gameState.journey.route.routeId,
        wasOffline: false,
        syncedAt: new Date(),
      };

      await addDoc(progressRef, {
        ...attempt,
        startedAt: Timestamp.fromDate(attempt.startedAt),
        completedAt: Timestamp.fromDate(attempt.completedAt),
        syncedAt: Timestamp.fromDate(attempt.syncedAt!),
      });

      // Update user stats
      await this.updateUserStats(result);
    } catch (error) {
      console.error('Error saving journey attempt:', error);
    }
  }

  /**
   * Update user statistics after journey completion
   */
  private async updateUserStats(result: JourneyResult): Promise<void> {
    try {
      const userRef = doc(db, 'drivemaster_users', this.userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const userData = userDoc.data();

      // Calculate new averages
      const totalJourneys = userData.totalJourneysCompleted + 1;
      const totalQuestions =
        userData.totalQuestionsAnswered + result.totalQuestions;
      const totalCorrect =
        userData.totalCorrectAnswers + result.correctAnswers;
      const totalIncorrect =
        userData.totalIncorrectAnswers + result.incorrectAnswers;
      const newAvgScore =
        totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      // Update credits
      const newCredits = userData.credits + result.creditsEarned;

      // Track perfect journeys for badge
      const perfectJourneys = result.score === 100 
        ? (userData.perfectJourneys || 0) + 1 
        : (userData.perfectJourneys || 0);

      await updateDoc(userRef, {
        totalJourneysCompleted: totalJourneys,
        totalQuestionsAnswered: totalQuestions,
        totalCorrectAnswers: totalCorrect,
        totalIncorrectAnswers: totalIncorrect,
        averageScore: newAvgScore,
        credits: newCredits,
        perfectJourneys,
        lastActiveDate: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Check and award badges
      const masteryService = new MasteryService(this.userId);
      await masteryService.checkAndAwardBadges();

      // Check if user can unlock next stage
      if (result.passed && this.gameState) {
        const advancement = await masteryService.checkAdvancement(this.gameState.journey.stage);
        if (advancement.canAdvance) {
          await masteryService.unlockNextStage(this.gameState.journey.stage);
        }
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  /**
   * Save checkpoint (for retry mechanism)
   */
  async saveCheckpoint(): Promise<string> {
    if (!this.gameState) {
      throw new Error('No active game state');
    }

    const checkpointId = `checkpoint-${Date.now()}`;
    this.gameState.checkpointId = checkpointId;

    // Save to localStorage for now
    if (typeof window !== 'undefined') {
      localStorage.setItem(checkpointId, JSON.stringify(this.gameState));
    }

    return checkpointId;
  }

  /**
   * Restore from checkpoint
   */
  async restoreCheckpoint(checkpointId: string): Promise<GameState | null> {
    if (typeof window === 'undefined') return null;

    const saved = localStorage.getItem(checkpointId);
    if (!saved) return null;

    this.gameState = JSON.parse(saved);
    return this.gameState;
  }

  /**
   * Get current game state
   */
  getGameState(): GameState | null {
    return this.gameState;
  }

  /**
   * Quit journey (penalty applied)
   */
  async quitJourney(): Promise<void> {
    if (!this.gameState) return;

    // Apply quit penalty
    try {
      const userRef = doc(db, 'drivemaster_users', this.userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newCredits = userData.credits - CREDIT_RULES.lose.quitJourney;

        await updateDoc(userRef, {
          credits: newCredits,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }
    } catch (error) {
      console.error('Error applying quit penalty:', error);
    }

    // Clear game state
    this.gameState = null;
  }
}
