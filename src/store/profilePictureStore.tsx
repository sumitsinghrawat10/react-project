import { useState, useEffect } from 'react';

import { BehaviorSubject } from 'rxjs';

let subject: any = null;

export const UserProfilePicture = () => {
    const [profilePicture, setProfilePicture] = useState('');

    if (!subject) {
        subject = new BehaviorSubject([]);
    }

    useEffect(() => {
        const subscription = subject.subscribe((profilePicture: any) => {
            setProfilePicture(profilePicture);
        });

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [profilePicture]);

    function addProfilePicture(newNote: any) {
        subject.next(newNote);
    }

    return { addProfilePicture, profilePicture };
};
