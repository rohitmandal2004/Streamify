"use client";

import { cn } from "../../lib/utils";
import { Link, useLocation } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
    onClick?: () => void;
}

interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
    undefined
);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...(props as React.ComponentProps<"div">)} />
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof motion.div>) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-2 md:px-4 py-4 hidden md:flex md:flex-col flex-shrink-0",
                className
            )}
            animate={{
                width: animate ? (open ? "280px" : "80px") : "280px",
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

const extractLinks = (children: React.ReactNode): React.ReactElement[] => {
    let links: React.ReactElement[] = [];
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        
        const element = child as React.ReactElement<any>;
        if (element.props && element.props.link) {
            links.push(element);
        } else if (element.props && element.props.children) {
            links.push(...extractLinks(element.props.children));
        }
    });
    return links;
};

export const MobileSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) => {
    // Extract links and filter out the user profile link for mobile 
    const links = extractLinks(children).filter(
        (link) => (link.props as any)?.link?.href !== "/profile"
    );
    
    return (
        <div
            className="h-[4.5rem] flex flex-row md:hidden items-center justify-around bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-white/[0.08] w-full text-white z-[100] fixed bottom-0 left-0 right-0 px-2 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
            {...props}
        >
            {links.map((link, idx) => {
                const element = link as React.ReactElement<any>;
                return (
                    <div key={idx} className="flex-1 flex justify-center mobile-sidebar-link h-full items-center">
                        {React.cloneElement(element, { className: cn(element.props.className, "justify-center w-full h-full !p-0 mx-auto flex items-center") })}
                    </div>
                );
            })}
        </div>
    );
};

export const SidebarLink = ({
    link,
    className,
    ...props
}: {
    link: Links;
    className?: string;
    props?: React.ComponentProps<typeof Link>;
}) => {
    const { open, animate } = useSidebar();
    const location = useLocation();
    const isActive = link.href !== "#" && location.pathname === link.href;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (link.onClick) {
            e.preventDefault();
            link.onClick();
        }
    };

    return (
        <Link
            to={link.href}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-3 group/sidebar py-2.5 px-2 rounded-xl transition-all duration-200 relative",
                isActive
                    ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-gray-400 hover:bg-white/[0.05] hover:text-white",
                className
            )}
            {...props}
        >
            {/* Active indicator bar */}
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
            )}

            {/* Icon wrapper */}
            <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200",
                isActive
                    ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                    : "text-gray-400 group-hover/sidebar:text-gray-200"
            )}>
                {link.icon}
            </div>

            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className={cn(
                    "text-sm font-medium whitespace-pre inline-block !p-0 !m-0 transition-colors duration-200",
                    isActive ? "text-white" : "text-gray-400 group-hover/sidebar:text-gray-200"
                )}
            >
                {link.label}
            </motion.span>

            {/* Active dot for mobile */}
            {isActive && (
                <motion.div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 md:hidden"
                    layoutId="activeDot"
                />
            )}
        </Link>
    );
};
