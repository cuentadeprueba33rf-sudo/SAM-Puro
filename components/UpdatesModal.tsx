import React from 'react';
import { XMarkIcon, SparklesIcon } from './icons';

interface UpdatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const updates = [
  {
    version: "v1.3.0",
    date: "25 de Julio, 2024",
    changes: [
      "**Modo de Ensayo Interactivo:** ¡Ahora puedes editar el esquema del ensayo antes de que SAM comience a escribir!",
      "**Integración de Cámara:** Utiliza la cámara de tu dispositivo para analizar objetos en tiempo real.",
      "**Mejoras de Accesibilidad:** Optimizaciones para lectores de pantalla y navegación por teclado.",
      "**Personalización de la Interfaz:** ¡Más opciones de personalización próximamente!",
    ],
  },
  {
    version: "v1.2.0",
    date: "15 de Julio, 2024",
    changes: [
      "**Búsqueda Web Mejorada:** Indicador de búsqueda en tiempo real y visualización de fuentes.",
      "**Rediseño de Interfaz:** Cabecera y pie de página flotantes para una experiencia más limpia.",
      "**Actualización de Modelos:** Integración de Gemini 2.5 Flash y 2.5 Pro para mayor rendimiento.",
      "**Modo Canvas Dev:** Mejoras en la barra de progreso para la creación de artefactos.",
    ],
  },
  {
    version: "v1.1.0",
    date: "8 de Julio, 2024",
    changes: [
      "**Nuevo Modo 'Canvas Dev':** Generación de código interactivo con vista previa en vivo.",
      "**Selector de Modelo:** Elige entre el modelo Standard y Flash (ahora SM-I3 y SM-I1).",
      "**Rediseño del Menú (+):** Acceso más rápido y claro a todos los modos de IA.",
    ],
  },
  {
    version: "v1.0.0",
    date: "1 de Julio, 2024",
    changes: [
      "**Lanzamiento Inicial de SAM IA:** Interfaz de chat con modos de IA especializados.",
    ],
  },
];

const UpdatesModal: React.FC<UpdatesModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const parseChange = (change: string) => {
        const parts = change.split('**');
        return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-text-main">{part}</strong> : part);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-surface-primary rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up border border-border-subtle max-h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-accent"/>
                        <span>Novedades</span>
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-secondary">
                        <XMarkIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
                
                <div className="overflow-y-auto pr-2 -mr-4 flex-1">
                    <div className="relative border-l-2 border-border-subtle/70 ml-3">
                        {updates.map((update, updateIndex) => (
                            <div key={update.version} className="mb-8 pl-8 relative">
                                <div className="absolute -left-[13px] top-1">
                                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center ring-8 ring-surface-primary">
                                        <SparklesIcon className="w-4 h-4 text-white"/>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="font-bold text-text-main text-lg">{update.version}</span>
                                    <span className="text-sm text-text-secondary">{update.date}</span>
                                </div>
                                <ul className="mt-2 space-y-2 text-text-secondary text-sm">
                                    {update.changes.map((change, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <svg className="w-4 h-4 text-accent flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                            <span>{parseChange(change)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={onClose} className="bg-accent text-white px-4 py-2 rounded-lg w-full hover:opacity-90 transition-opacity mt-8 flex-shrink-0">
                    Entendido
                </button>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default UpdatesModal;
