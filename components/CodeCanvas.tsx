import React, { useState, useMemo, useEffect } from 'react';
import type { Artifact } from '../types';
import { XMarkIcon, DocumentDuplicateIcon, WindowIcon, DevicePhoneMobileIcon, DeviceTabletIcon, ComputerDesktopIcon, InformationCircleIcon, CodeBracketIcon, CheckIcon, PencilSquareIcon, Bars3Icon, FolderIcon } from './icons';

const highlightCode = (code: string, language: string) => {
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (language === 'html') {
    highlighted = highlighted.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token comment">$1</span>');
    highlighted = highlighted.replace(/(&lt;\/?)([a-zA-Z0-9\-]+)/g, '$1<span class="token tag">$2</span>');
    highlighted = highlighted.replace(/([a-zA-Z\-:]+)=(".*?"|'.*?')/g, '<span class="token attr-name">$1</span>=<span class="token attr-value">$2</span>');
    highlighted = highlighted.replace(/(&lt;!DOCTYPE html&gt;)/i, '<span class="token doctype">$1</span>');
  }
  highlighted = highlighted.replace(/(\b)(function|var|let|const|return|if|else|for|while|import|export|from|document|window)(\b)/g, '$1<span class="token keyword">$2</span>$3');
  highlighted = highlighted.replace(/([a-zA-Z-]+)(?=:)/g, '<span class="token property">$1</span>');
  highlighted = highlighted.replace(/([#.]-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g, '<span class="token selector">$1</span>');
  
  return highlighted;
};

const DeviceFrame: React.FC<{ viewport: 'desktop' | 'tablet' | 'mobile', children: React.ReactNode }> = ({ viewport, children }) => {
    const baseClasses = "bg-white shadow-2xl rounded-lg transition-all duration-300 ease-in-out flex flex-col drop-shadow-2xl";
    const frameStyles = {
        mobile: "w-[375px] h-[667px] border-8 border-black rounded-[40px] p-2",
        tablet: "w-[768px] h-[1024px] border-[14px] border-black rounded-[24px] p-2",
        desktop: "w-full h-full border border-border-subtle rounded-xl",
    };

    if (viewport === 'desktop') {
        return (
            <div className={`${baseClasses} ${frameStyles.desktop}`}>
                <div className="flex-shrink-0 h-10 bg-surface-secondary rounded-t-lg border-b border-border-subtle flex items-center px-4 gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="flex-1 overflow-hidden">{children}</div>
            </div>
        )
    }

    return (
        <div className={`${baseClasses} ${frameStyles[viewport]}`}>
            <div className="flex-1 overflow-hidden rounded-lg">{children}</div>
        </div>
    );
};


const CodeCanvas: React.FC<{ artifacts: Artifact[]; onClose: () => void; }> = ({ artifacts, onClose }) => {
  const [view, setView] = useState<'preview' | 'code' | 'info'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<Artifact | null>(null);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsFileExplorerOpen(false);
      } else {
        setIsFileExplorerOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (artifacts && artifacts.length > 0) {
        const htmlFile = artifacts.find(a => a.filepath.endsWith('.html'));
        setActiveFile(htmlFile || artifacts[0]);
    }
  }, [artifacts]);
  
  const highlightedCode = useMemo(() => activeFile ? highlightCode(activeFile.code, activeFile.language) : '', [activeFile]);

  const srcDoc = useMemo(() => {
    if (!artifacts || artifacts.length === 0) return '';
    
    const htmlFile = artifacts.find(a => a.language === 'html' || a.filepath.endsWith('.html'));
    if (!htmlFile) return '<html><body style="font-family: sans-serif; color: #555; display: grid; place-content: center; height: 100vh;">No hay archivo HTML para la vista previa.</body></html>';

    let htmlContent = htmlFile.code;
    const cssFiles = artifacts.filter(a => a.language === 'css' || a.filepath.endsWith('.css'));
    const cssContent = cssFiles.map(file => `<style>\n${file.code}\n</style>`).join('\n');
    const jsFiles = artifacts.filter(a => a.language === 'javascript' || a.filepath.endsWith('.js'));
    const jsContent = jsFiles.map(file => `<script type="module">\n${file.code}\n</script>`).join('\n');

    htmlContent = htmlContent.includes('</head>') ? htmlContent.replace('</head>', `${cssContent}\n</head>`) : `<head>${cssContent}</head>${htmlContent}`;
    htmlContent = htmlContent.includes('</body>') ? htmlContent.replace('</body>', `${jsContent}\n</body>`) : `${htmlContent}${jsContent}`;

    return htmlContent;
  }, [artifacts]);

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePopOut = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(srcDoc);
      newWindow.document.close();
    }
  };
  
  const lineNumbers = useMemo(() => activeFile ? activeFile.code.split('\n').map((_, i) => i + 1) : [], [activeFile]);

  const fileExplorerPanel = (
    <div className={`bg-surface-primary border-r border-border-subtle flex-shrink-0 flex flex-col transition-all duration-300 ${isFileExplorerOpen ? 'w-56' : 'w-0'}`}>
        <h3 className="font-semibold text-sm text-text-main p-3 border-b border-border-subtle flex items-center gap-2 whitespace-nowrap">
            <FolderIcon className="w-5 h-5 text-accent flex-shrink-0"/>
            Explorador de Archivos
        </h3>
        <ul className="p-2 space-y-1 flex-1 overflow-y-auto">
            {artifacts.map(art => (
                <li key={art.id}>
                    <button
                        onClick={() => {
                            setActiveFile(art);
                            if (window.innerWidth <= 768) setIsFileExplorerOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm truncate transition-colors ${activeFile?.id === art.id ? 'bg-accent text-white font-semibold' : 'text-text-secondary hover:bg-surface-secondary hover:text-text-main'}`}
                    >
                        {art.filepath}
                    </button>
                </li>
            ))}
        </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-bg-main/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in-up">
        <div className="bg-surface-primary w-full h-full md:max-w-7xl md:h-full md:max-h-[95vh] rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-subtle">
            <header className="relative flex-shrink-0 flex items-center justify-between p-2 sm:p-3 border-b border-border-subtle bg-surface-primary z-20">
                <div className="flex items-center gap-2 flex-1">
                    <button onClick={() => setIsFileExplorerOpen(p => !p)} className="p-2 rounded-lg hover:bg-surface-secondary transition-colors md:hidden" title="Explorador de Archivos">
                        <FolderIcon className="w-5 h-5 text-text-secondary" />
                    </button>
                    <div className="p-2 bg-accent/10 rounded-lg hidden sm:block">
                        <CodeBracketIcon className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="font-semibold text-text-main truncate">{artifacts.length > 1 ? 'Proyecto de Canvas' : (artifacts[0]?.title || 'Artefacto')}</h2>
                </div>
                
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center bg-surface-secondary p-1 rounded-lg text-sm font-semibold">
                    <button onClick={() => setView('preview')} className={`px-3 py-1 rounded-md transition-colors ${view === 'preview' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-main'}`}>Preview</button>
                    <button onClick={() => setView('code')} className={`px-3 py-1 rounded-md transition-colors ${view === 'code' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-main'}`}>Code</button>
                    <button onClick={() => setView('info')} className={`px-3 py-1 rounded-md transition-colors ${view === 'info' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-main'}`}>Info</button>
                </div>

                <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                    {view === 'preview' && (
                        <div className="hidden sm:flex items-center gap-1 p-1 bg-surface-secondary rounded-lg">
                            <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded-md ${viewport === 'mobile' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-border-subtle'}`} title="Mobile"><DevicePhoneMobileIcon className="w-5 h-5" /></button>
                            <button onClick={() => setViewport('tablet')} className={`p-1.5 rounded-md ${viewport === 'tablet' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-border-subtle'}`} title="Tablet"><DeviceTabletIcon className="w-5 h-5" /></button>
                            <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded-md ${viewport === 'desktop' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-border-subtle'}`} title="Desktop"><ComputerDesktopIcon className="w-5 h-5" /></button>
                        </div>
                    )}
                    <button onClick={handleCopy} className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-sm font-medium ${copied ? 'bg-green-500/10 text-green-500' : 'bg-surface-secondary hover:bg-border-subtle text-text-secondary hover:text-text-main'}`}>
                       {copied ? <CheckIcon className="w-5 h-5" /> : <DocumentDuplicateIcon className="w-5 h-5" />}
                       <span className="hidden md:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                    <button onClick={handlePopOut} className="p-2 rounded-lg hover:bg-surface-secondary transition-colors hidden sm:block" title="Abrir en nueva ventana">
                        <WindowIcon className="w-5 h-5 text-text-secondary" />
                    </button>
                     <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-secondary transition-colors">
                        <XMarkIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
            </header>
            
            <main className="flex-1 overflow-hidden bg-bg-main relative flex">
                {/* Mobile file explorer overlay */}
                <div className={`md:hidden fixed inset-0 z-10 transition-opacity duration-300 ${isFileExplorerOpen ? 'bg-black/50' : 'bg-black/0 pointer-events-none'}`} onClick={() => setIsFileExplorerOpen(false)}></div>
                <div className={`md:hidden fixed top-0 left-0 h-full z-20 transition-transform duration-300 ${isFileExplorerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {fileExplorerPanel}
                </div>

                {/* Desktop file explorer */}
                <div className="hidden md:flex h-full">
                    {fileExplorerPanel}
                </div>

                <div className="flex-1 overflow-hidden">
                    {view === 'code' && (
                        <div className="h-full overflow-auto code-view">
                            <div className="flex font-mono text-sm p-4 text-left">
                                <div className="text-right text-text-secondary/70 select-none pr-4 sticky top-0">
                                    {lineNumbers.map(n => <div key={n}>{n}</div>)}
                                </div>
                                <pre className="flex-1 whitespace-pre-wrap break-words">
                                    <code className="text-gray-300" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                                </pre>
                            </div>
                        </div>
                    )}
                    {view === 'preview' && (
                        <div className="h-full w-full flex items-center justify-center canvas-backdrop p-4 overflow-auto">
                            <DeviceFrame viewport={viewport}>
                                <iframe srcDoc={srcDoc} title="Artifact Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" />
                            </DeviceFrame>
                        </div>
                    )}
                    {view === 'info' && activeFile && (
                        <div className="h-full w-full flex items-center justify-center p-8 canvas-backdrop">
                            <div className="max-w-2xl w-full bg-surface-primary/80 backdrop-blur-lg p-8 rounded-2xl border border-border-subtle shadow-lg">
                                <h3 className="text-2xl font-bold text-text-main flex items-center gap-3 mb-8"><InformationCircleIcon className="w-8 h-8 text-accent"/><span>Detalles del Archivo</span></h3>
                                <div className="space-y-4">
                                    <div className="bg-surface-secondary p-4 rounded-lg flex items-start gap-4"><PencilSquareIcon className="w-6 h-6 text-accent mt-1 flex-shrink-0" /><div><h4 className="font-semibold text-text-main">Nombre del Archivo</h4><p className="text-text-secondary font-mono text-sm">{activeFile.filepath}</p></div></div>
                                    <div className="bg-surface-secondary p-4 rounded-lg flex items-start gap-4"><CodeBracketIcon className="w-6 h-6 text-accent mt-1 flex-shrink-0" /><div><h4 className="font-semibold text-text-main">Lenguaje</h4><p className="text-text-secondary font-mono text-sm uppercase">{activeFile.language}</p></div></div>
                                    <div className="bg-surface-secondary p-4 rounded-lg flex items-start gap-4"><Bars3Icon className="w-6 h-6 text-accent mt-1 flex-shrink-0" /><div><h4 className="font-semibold text-text-main">Líneas de Código</h4><p className="text-text-secondary font-mono text-sm">{lineNumbers.length}</p></div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
        <style>{`
            :root { --code-bg: #1e1f20; --token-comment: #6a9955; --token-tag: #569cd6; --token-attr-name: #9cdcfe; --token-attr-value: #ce9178; --token-doctype: #4ec9b0; --token-property: #d7ba7d; --token-value: #ce9178; --token-keyword: #c586c0; --token-selector: #d7ba7d; }
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            .code-view { background-color: var(--code-bg); font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace; scrollbar-color: var(--color-text-secondary) transparent; scrollbar-width: thin; }
            .code-view::-webkit-scrollbar { width: 8px; }
            .code-view::-webkit-scrollbar-track { background: transparent; }
            .code-view::-webkit-scrollbar-thumb { background-color: var(--color-border-subtle); border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
            .code-view::-webkit-scrollbar-thumb:hover { background-color: var(--color-text-secondary); }
            .canvas-backdrop { background-color: var(--color-bg-main); background-image: radial-gradient(at 0% 0%, hsla(241, 60%, 53%, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(241, 60%, 53%, 0.1) 0px, transparent 50%); }
            .dark .canvas-backdrop { background-image: radial-gradient(at 0% 0%, hsla(241, 60%, 53%, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(241, 60%, 53%, 0.15) 0px, transparent 50%); }
            .token.comment { color: var(--token-comment); } .token.tag { color: var(--token-tag); } .token.attr-name { color: var(--token-attr-name); } .token.attr-value { color: var(--token-attr-value); } .token.doctype { color: var(--token-doctype); } .token.property { color: var(--token-property); } .token.selector { color: var(--token-selector); } .token.value { color: var(--token-value); } .token.keyword { color: var(--token-keyword); }
        `}</style>
    </div>
  );
};

export default CodeCanvas;
