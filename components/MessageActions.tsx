import React, { useState, useRef, useEffect } from 'react';
import { DocumentDuplicateIcon, CheckIcon, GlobeAltIcon } from './icons';

interface MessageActionsProps {
    text: string;
    groundingMetadata?: any[];
}

const MessageActions: React.FC<MessageActionsProps> = ({ text, groundingMetadata }) => {
    const [copied, setCopied] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const sourcesRef = useRef<HTMLDivElement>(null);
    const iconClasses = "w-5 h-5 text-text-secondary group-hover:text-text-main transition-colors";

    const hasWebSources = groundingMetadata && groundingMetadata.some(c => c.web);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sourcesRef.current && !sourcesRef.current.contains(event.target as Node)) {
                setShowSources(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCopy = () => {
        if (copied || !text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => console.error("Failed to copy text: ", err));
    };
    
    return (
        <div ref={sourcesRef} className="relative flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
            {text && (
                <button 
                    onClick={handleCopy} 
                    aria-label="Copiar" 
                    className="p-1.5 focus:outline-none focus:ring-2 focus:ring-accent rounded-full group hover:bg-surface-secondary"
                >
                    {copied ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : (
                        <DocumentDuplicateIcon className={iconClasses} />
                    )}
                </button>
            )}
            
            {hasWebSources && (
                <button 
                    onClick={() => setShowSources(prev => !prev)} 
                    aria-label="Fuentes" 
                    className="p-1.5 focus:outline-none focus:ring-2 focus:ring-accent rounded-full group hover:bg-surface-secondary"
                >
                    <GlobeAltIcon className={iconClasses} />
                </button>
            )}

            {showSources && hasWebSources && (
                <div 
                    className="absolute bottom-full left-0 mb-2 w-72 bg-surface-primary rounded-lg shadow-lg border border-border-subtle p-2 z-10"
                    style={{ animation: 'fade-in-up-sm 0.1s ease-out' }}
                >
                   <h4 className="font-semibold text-sm text-text-main px-2 pb-1">Fuentes</h4>
                   <ul className="max-h-48 overflow-y-auto">
                       {groundingMetadata.filter(chunk => chunk.web).map((chunk, index) => (
                           <li key={`web-${index}`}>
                               <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" title={chunk.web.title} className="flex items-start gap-2 text-xs text-accent-blue hover:underline truncate p-2 rounded hover:bg-surface-secondary">
                                   <GlobeAltIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                   <span className="flex-1">{chunk.web.title || chunk.web.uri}</span>
                               </a>
                           </li>
                       ))}
                   </ul>
                </div>
            )}
        </div>
    );
};

export default MessageActions;
