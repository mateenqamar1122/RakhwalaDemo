import {
    Edit,
    ChevronDown,
    Trash,
    Share,
    Copy,
} from 'lucide-react';
import { motion } from "framer-motion";
import { useState } from "react";

const StaggeredDropDown = ({ trigger = "Post actions", items = [
        { icon: Edit, text: "Edit" },
        { icon: Copy, text: "Duplicate" },
        { icon: Share, text: "Share" },
        { icon: Trash, text: "Remove" },
    ], className = "" } = {}) => {
    const [open, setOpen] = useState(false);

    return (
        <motion.div animate={open ? "open" : "closed"} className={`relative ${className}`}>
            <button
                onClick={() => setOpen((pv) => !pv)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-primary-foreground bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
                {typeof trigger === 'string' ? (
                    <span className="font-medium text-sm">{trigger}</span>
                ) : (
                    trigger
                )}
                <motion.span variants={iconVariants}>
                    <ChevronDown size={14} />
                </motion.span>
            </button>

            <motion.ul
                initial={wrapperVariants.closed}
                variants={wrapperVariants}
                style={{ originY: "top", translateX: "-50%" }}
                className="flex flex-col gap-1 p-1.5 rounded-md bg-popover border border-border shadow-lg absolute top-[110%] left-[50%] w-40 overflow-hidden z-50"
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {items.map((item: any, idx: number) => (
                    <Option key={idx} setOpen={setOpen} Icon={item.icon} text={item.text} onClick={item.onClick} />
                ))}
            </motion.ul>
        </motion.div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Option = ({ text, Icon, setOpen, onClick }: { text: string; Icon: any; setOpen: (open: boolean) => void; onClick?: () => void }) => {
    return (
        <motion.li
            variants={itemVariants}
            onClick={() => {
                onClick?.();
                setOpen(false);
            }}
            className="flex items-center gap-1.5 w-full p-1.5 text-xs font-medium whitespace-nowrap rounded-sm hover:bg-accent/10 text-foreground hover:text-accent transition-colors cursor-pointer"
        >
            <motion.span variants={actionIconVariants}>
                <Icon size={14} />
            </motion.span>
            <span>{text}</span>
        </motion.li>
    );
};

export default StaggeredDropDown;

const wrapperVariants = {
    open: {
        scaleY: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
    closed: {
        scaleY: 0,
        transition: {
            when: "afterChildren",
            staggerChildren: 0.1,
        },
    },
};

const iconVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
};

const itemVariants = {
    open: {
        opacity: 1,
        y: 0,
        transition: {
            when: "beforeChildren",
        },
    },
    closed: {
        opacity: 0,
        y: -15,
        transition: {
            when: "afterChildren",
        },
    },
};

const actionIconVariants = {
    open: { scale: 1, y: 0 },
    closed: { scale: 0, y: -7 },
};