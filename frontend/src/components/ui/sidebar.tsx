"use client";

import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";
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
                "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0",
                className
            )}
            animate={{
                width: animate ? (open ? "300px" : "60px") : "300px",
            }}
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
    // (since it takes up space and is already shown in the top navbar on some pages)
    const links = extractLinks(children).filter(
        (link) => link.props?.link?.href !== "/profile"
    );
    
    return (
        <div
            className="h-[4.5rem] flex flex-row md:hidden items-center justify-around bg-[#000000]/90 backdrop-blur-xl border-t border-white/10 w-full text-white z-[100] fixed bottom-0 left-0 right-0 px-2 safe-area-bottom"
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
                "flex items-center justify-start gap-2 group/sidebar py-2",
                className
            )}
            {...props}
        >
            {link.icon}
            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
