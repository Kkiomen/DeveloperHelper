import React, { createContext, useEffect, useRef, ReactNode, useContext } from 'react';
import Pusher, {Channel} from 'pusher-js';

// Definiujemy typ dla kontekstu
interface PusherContextType {
    pusher: Pusher | null;
    subscribeToChannel: (channelName: string) => Channel | null;
    unsubscribeFromChannel: (channelName: string) => void;
}

// Tworzymy kontekst z domyślną wartością `null`
const PusherContext = createContext<PusherContextType | null>(null);

interface PusherProviderProps {
    children: ReactNode;
}

export const PusherProvider: React.FC<PusherProviderProps> = ({ children }) => {
    const pusherRef = useRef<Pusher | null>(null);

    if (!pusherRef.current) {
        pusherRef.current = new Pusher('0d1135b644463d95fefe', {
            cluster: 'eu',
        });
    }

    useEffect(() => {
        // Funkcja sprzątająca uruchamia się tylko przy zamknięciu aplikacji
        return () => {
            if (pusherRef.current) {
                console.log('Zamykanie połączenia Pusher');
                // pusherRef.current.disconnect();
            }
        };
    }, []);

    // Funkcja do subskrybowania kanału
    const subscribeToChannel = (channelName: string): Channel | null => {
        if (pusherRef.current) {
            return pusherRef.current.subscribe(channelName);
        }
        return null;
    };

    // Funkcja do odsubskrybowania kanału
    const unsubscribeFromChannel = (channelName: string): void => {
        if (pusherRef.current) {
            pusherRef.current.unsubscribe(channelName);
        }
    };

    return (
        <PusherContext.Provider
            value={{
                pusher: pusherRef.current,
                subscribeToChannel,
                unsubscribeFromChannel
            }}
        >
            {children}
        </PusherContext.Provider>
    );
};

// Customowy hook do używania kontekstu Pushera
export const usePusher = (): PusherContextType => {
    const context = useContext(PusherContext);
    if (!context) {
        throw new Error('usePusher must be used within a PusherProvider');
    }
    return context;
};
