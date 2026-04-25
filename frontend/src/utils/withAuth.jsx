import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FullPageSkeleton } from "../components/PageSkeletons";

const withAuth = (WrappedComponent, skeletonVariant = 'dashboard') => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const [isChecking, setIsChecking] = useState(true);

        const isAuthenticated = () => {
            if(localStorage.getItem("token")) {
                return true;
            } 
            return false;
        }

        useEffect(() => {
            if(!isAuthenticated()) {
                router("/auth");
            } else {
                // Small delay for skeleton to be visible (feels more polished)
                const timer = setTimeout(() => setIsChecking(false), 400);
                return () => clearTimeout(timer);
            }
        }, []);

        if (isChecking) {
            return <FullPageSkeleton variant={skeletonVariant} />;
        }

        return <WrappedComponent {...props} />;
    }

    return AuthComponent;
}

export default withAuth;