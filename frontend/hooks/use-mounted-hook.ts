import { useEffect } from 'react';
import { useState } from 'react';

const useMounted = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        };
    }, []);

    return isMounted;
};

export default useMounted;