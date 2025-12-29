import { db, FieldValue } from "../config/firebase";
import { COLLECTIONS, ERROR_CODES } from "../config/constants";
import { P2POffer, OfferType, OfferStatus, PaymentMethod, AssetType, PriceType } from "../types";

/**
 * P2P Offer Management Service
 */

export class OfferService {
  /**
   * Create a new P2P offer
   */
  static async createOffer(params: {
    userId: string;
    offerType: OfferType;
    asset: AssetType;
    fiatCurrency: AssetType;
    priceType: PriceType;
    price: number;
    minLimit: number;
    maxLimit: number;
    availableAmount: number;
    paymentMethods: PaymentMethod[];
    paymentTimeWindow: number;
    terms: string;
    autoReply?: string;
  }): Promise<string> {
    const offerRef = db.collection(COLLECTIONS.P2P_OFFERS).doc();

    const offer: Omit<P2POffer, "id"> = {
      userId: params.userId,
      offerType: params.offerType,
      asset: params.asset,
      fiatCurrency: params.fiatCurrency,
      priceType: params.priceType,
      price: params.price,
      minLimit: params.minLimit,
      maxLimit: params.maxLimit,
      availableAmount: params.availableAmount,
      paymentMethods: params.paymentMethods,
      paymentTimeWindow: params.paymentTimeWindow,
      terms: params.terms,
      status: "active",
      completedOrders: 0,
      totalOrders: 0,
      rating: 0,
      autoReply: params.autoReply,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    };

    await offerRef.set(offer);

    console.log(`P2P offer created: ${offerRef.id} by user ${params.userId}`);

    return offerRef.id;
  }

  /**
   * Get offer by ID
   */
  static async getOffer(offerId: string): Promise<P2POffer | null> {
    const offerDoc = await db.collection(COLLECTIONS.P2P_OFFERS).doc(offerId).get();

    if (!offerDoc.exists) {
      return null;
    }

    return {
      id: offerDoc.id,
      ...offerDoc.data(),
    } as P2POffer;
  }

  /**
   * Update offer
   */
  static async updateOffer(
    offerId: string,
    userId: string,
    updates: Partial<P2POffer>
  ): Promise<void> {
    const offerRef = db.collection(COLLECTIONS.P2P_OFFERS).doc(offerId);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
      throw new Error(ERROR_CODES.OFFER_NOT_FOUND);
    }

    const offer = offerDoc.data() as P2POffer;

    // Verify ownership
    if (offer.userId !== userId) {
      throw new Error(ERROR_CODES.FORBIDDEN);
    }

    await offerRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    console.log(`Offer ${offerId} updated by user ${userId}`);
  }

  /**
   * Pause/Resume offer
   */
  static async toggleOfferStatus(offerId: string, userId: string): Promise<OfferStatus> {
    const offerRef = db.collection(COLLECTIONS.P2P_OFFERS).doc(offerId);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
      throw new Error(ERROR_CODES.OFFER_NOT_FOUND);
    }

    const offer = offerDoc.data() as P2POffer;

    // Verify ownership
    if (offer.userId !== userId) {
      throw new Error(ERROR_CODES.FORBIDDEN);
    }

    const newStatus: OfferStatus = offer.status === "active" ? "paused" : "active";

    await offerRef.update({
      status: newStatus,
      updatedAt: new Date(),
      lastActiveAt: newStatus === "active" ? new Date() : offer.lastActiveAt,
    });

    console.log(`Offer ${offerId} status changed to: ${newStatus}`);

    return newStatus;
  }

  /**
   * Delete offer
   */
  static async deleteOffer(offerId: string, userId: string): Promise<void> {
    const offerRef = db.collection(COLLECTIONS.P2P_OFFERS).doc(offerId);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
      throw new Error(ERROR_CODES.OFFER_NOT_FOUND);
    }

    const offer = offerDoc.data() as P2POffer;

    // Verify ownership
    if (offer.userId !== userId) {
      throw new Error(ERROR_CODES.FORBIDDEN);
    }

    // Check for active orders
    const activeOrdersSnapshot = await db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("offerId", "==", offerId)
      .where("status", "in", ["pending-payment", "awaiting-release"])
      .get();

    if (!activeOrdersSnapshot.empty) {
      throw new Error("Cannot delete offer with active orders");
    }

    // Soft delete (mark as deleted)
    await offerRef.update({
      status: "deleted",
      updatedAt: new Date(),
    });

    console.log(`Offer ${offerId} deleted by user ${userId}`);
  }

  /**
   * Get user's offers
   */
  static async getUserOffers(userId: string, status?: OfferStatus): Promise<P2POffer[]> {
    let query = db
      .collection(COLLECTIONS.P2P_OFFERS)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status) as any;
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as P2POffer[];
  }

  /**
   * Search offers (marketplace)
   */
  static async searchOffers(params: {
    offerType?: OfferType;
    asset?: AssetType;
    fiatCurrency?: AssetType;
    paymentMethods?: PaymentMethod[];
    minAmount?: number;
    maxAmount?: number;
    limit?: number;
  }): Promise<P2POffer[]> {
    let query: any = db
      .collection(COLLECTIONS.P2P_OFFERS)
      .where("status", "==", "active")
      .orderBy("lastActiveAt", "desc");

    if (params.offerType) {
      query = query.where("offerType", "==", params.offerType);
    }

    if (params.asset) {
      query = query.where("asset", "==", params.asset);
    }

    if (params.fiatCurrency) {
      query = query.where("fiatCurrency", "==", params.fiatCurrency);
    }

    query = query.limit(params.limit || 50);

    const snapshot = await query.get();

    let offers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as P2POffer[];

    // Filter by payment methods (client-side since array-contains only works for one value)
    if (params.paymentMethods && params.paymentMethods.length > 0) {
      offers = offers.filter((offer) =>
        params.paymentMethods!.some((method) => offer.paymentMethods.includes(method))
      );
    }

    // Filter by amount range
    if (params.minAmount) {
      offers = offers.filter((offer) => offer.maxLimit >= params.minAmount!);
    }

    if (params.maxAmount) {
      offers = offers.filter((offer) => offer.minLimit <= params.maxAmount!);
    }

    return offers;
  }

  /**
   * Update offer statistics after order completion
   */
  static async updateOfferStats(offerId: string, completed: boolean): Promise<void> {
    const offerRef = db.collection(COLLECTIONS.P2P_OFFERS).doc(offerId);

    await offerRef.update({
      totalOrders: FieldValue.increment(1),
      completedOrders: completed ? FieldValue.increment(1) : FieldValue.increment(0),
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    });

    // Calculate and update rating
    const offerDoc = await offerRef.get();
    if (offerDoc.exists) {
      const offer = offerDoc.data() as P2POffer;
      const rating = offer.completedOrders > 0
        ? (offer.completedOrders / offer.totalOrders) * 5
        : 0;

      await offerRef.update({ rating });
    }
  }

  /**
   * Decrease available amount after order creation
   */
  static async decreaseAvailableAmount(offerId: string, amount: number): Promise<void> {
    const offerRef = db.collection(COLLECTIONS.P2P_OFFERS).doc(offerId);

    return await db.runTransaction(async (transaction) => {
      const offerDoc = await transaction.get(offerRef);

      if (!offerDoc.exists) {
        throw new Error(ERROR_CODES.OFFER_NOT_FOUND);
      }

      const offer = offerDoc.data() as P2POffer;

      if (offer.availableAmount < amount) {
        throw new Error(ERROR_CODES.OFFER_UNAVAILABLE);
      }

      transaction.update(offerRef, {
        availableAmount: offer.availableAmount - amount,
        updatedAt: new Date(),
      });
    });
  }

  /**
   * Increase available amount after order cancellation
   */
  static async increaseAvailableAmount(offerId: string, amount: number): Promise<void> {
    await db.collection(COLLECTIONS.P2P_OFFERS).doc(offerId).update({
      availableAmount: FieldValue.increment(amount),
      updatedAt: new Date(),
    });
  }
}
