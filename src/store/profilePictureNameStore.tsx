import { useState, useEffect } from 'react';

import { BehaviorSubject } from 'rxjs';

let subject: any = null;

export const UserProfilePictureName = () => {
    const [profilePictureName, setProfilePictureName] = useState('');

    if (!subject) {
        subject = new BehaviorSubject([]);
    }

    useEffect(() => {
        const subscription = subject.subscribe((profilePicName: any) => {
            setProfilePictureName(profilePicName);
        });

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [profilePictureName]);

    function addProfilePictureName(newNote: any) {
        subject.next(newNote);
    }

    return { addProfilePictureName, profilePictureName };
};
