'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AnimatedInput, AnimatedCard, PageLoader } from '@/components/ui';
import { User, Phone, Calendar, CreditCard, MapPin, Building, Globe, Mail } from 'lucide-react';

interface UserProfileData {
    fullName: string;
    phone: string;
    email: string;
    membershipTier: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    dateOfBirth?: string;
    idNumber?: string;
}

export default function ProfilePage() {
    const { user, updateUserProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [profileData, setProfileData] = useState<UserProfileData>({
        fullName: '',
        phone: '',
        email: '',
        membershipTier: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        dateOfBirth: '',
        idNumber: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkProfileCompletion = async () => {
            if (!user) {
                router.push('/auth');
                return;
            }

            try {
                setIsLoading(true);
                const db = getFirestore();
                const userDoc = await getDoc(doc(db, "users", user.uid));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setProfileData({
                        fullName: userData.fullName || '',
                        phone: userData.phone || '',
                        email: userData.email || '',
                        membershipTier: userData.membershipTier || '',
                        address: userData.address || '',
                        city: userData.city || '',
                        country: userData.country || '',
                        postalCode: userData.postalCode || '',
                        dateOfBirth: userData.dateOfBirth || '',
                        idNumber: userData.idNumber || '',
                    });

                    // Check if this is a new user who hasn't completed their profile
                    setIsNewUser(!userData.profileCompleted);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkProfileCompletion();
    }, [user, router]);

    if (isLoading) {
        return <PageLoader message="Loading profile..." />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await updateUserProfile({
                ...profileData,
                profileCompleted: true,
            });

            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });

            // If this was a new user completing their profile for the first time,
            // redirect them to the dashboard
            if (isNewUser) {
                router.push('/dashboard');
            }
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <AnimatedCard className="max-w-5xl mx-auto">
                <CardHeader>
                    <CardTitle>{isNewUser ? 'Complete Your Profile' : 'Edit Profile'}</CardTitle>
                    <CardDescription>
                        {isNewUser 
                            ? 'Please complete your profile information to continue' 
                            : 'Update your personal information'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatedInput
                                id="fullName"
                                label="Full Name"
                                value={profileData.fullName}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    fullName: e.target.value
                                }))}
                                icon={User}
                                placeholder="Enter your full name"
                                required
                            />
                            <AnimatedInput
                                id="email"
                                label="Email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    email: e.target.value
                                }))}
                                icon={Mail}
                                placeholder="your.email@example.com"
                                disabled
                                helperText="Email cannot be changed"
                            />
                            <AnimatedInput
                                id="phone"
                                label="Phone Number"
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    phone: e.target.value
                                }))}
                                icon={Phone}
                                placeholder="+27 12 345 6789"
                                required
                            />
                            <AnimatedInput
                                id="dateOfBirth"
                                label="Date of Birth"
                                type="date"
                                value={profileData.dateOfBirth}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    dateOfBirth: e.target.value
                                }))}
                                icon={Calendar}
                                required
                            />
                            <AnimatedInput
                                id="idNumber"
                                label="ID Number"
                                value={profileData.idNumber}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    idNumber: e.target.value
                                }))}
                                icon={CreditCard}
                                placeholder="1234567890123"
                                required
                            />
                            <AnimatedInput
                                id="address"
                                label="Address"
                                value={profileData.address}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    address: e.target.value
                                }))}
                                icon={MapPin}
                                placeholder="123 Main Street"
                                required
                            />
                            <AnimatedInput
                                id="city"
                                label="City"
                                value={profileData.city}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    city: e.target.value
                                }))}
                                icon={Building}
                                placeholder="Johannesburg"
                                required
                            />
                            <AnimatedInput
                                id="country"
                                label="Country"
                                value={profileData.country}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    country: e.target.value
                                }))}
                                icon={Globe}
                                placeholder="South Africa"
                                required
                            />
                            <AnimatedInput
                                id="postalCode"
                                label="Postal Code"
                                value={profileData.postalCode}
                                onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    postalCode: e.target.value
                                }))}
                                icon={Mail}
                                placeholder="2000"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4 pt-4">
                            {!isNewUser && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="min-w-[150px]"
                            >
                                {isSubmitting ? 'Saving...' : isNewUser ? 'Complete Profile' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </AnimatedCard>
        </div>
        </ProtectedRoute>
    );
}