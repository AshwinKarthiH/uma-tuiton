import { useEffect, useRef, useState } from 'react';

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
const WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfjsLoaded = false;
let workerBlobUrl = null;

export default function PDFViewerModal({ isOpen, onClose, pdfUrl, documentTitle, breadcrumb }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const renderTaskRef = useRef(null);

  // Load PDF.js once
  useEffect(() => {
    if (!isOpen || pdfjsLoaded) return;
    
    const loadPdfJs = async () => {
      try {
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = PDFJS_CDN;
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }
        
        if (!workerBlobUrl) {
          const resp = await fetch(WORKER_CDN);
          const blob = await resp.blob();
          workerBlobUrl = URL.createObjectURL(blob);
        }
        
        window.pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(workerBlobUrl);
        pdfjsLoaded = true;
        loadDocument(pdfUrl);
      } catch (err) {
        setError('Failed to load PDF engine.');
      }
    };
    
    loadPdfJs();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && window.pdfjsLib) {
      loadDocument(pdfUrl);
    }
  }, [isOpen, pdfUrl]);

  const loadDocument = async (url) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    try {
      let documentTask;
      if (url.startsWith('data:application/pdf;base64,')) {
        const base64Data = url.split(',')[1];
        const binary = atob(base64Data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        documentTask = window.pdfjsLib.getDocument({ data: array });
      } else {
        documentTask = window.pdfjsLib.getDocument(url);
      }
      const pdf = await documentTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNum(1);
    } catch (err) {
      console.error(err);
      setError('Error loading PDF.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum, scale);
    }
  }, [pdfDoc, pageNum, scale]);

  const renderPage = async (num, currentScale) => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      setLoading(true);
      const page = await pdfDoc.getPage(num);
      
      let finalScale = currentScale;
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const widthScale = containerWidth / unscaledViewport.width;
        finalScale = widthScale * currentScale;
      }
      
      const viewport = page.getViewport({ scale: finalScale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height =  Math.floor(viewport.height) + "px";

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      const renderContext = {
        canvasContext: ctx,
        transform: transform,
        viewport: viewport
      };
      
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setPageNum(p => Math.max(1, p - 1));
      if (e.key === 'ArrowRight') setPageNum(p => Math.min(numPages, p + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, numPages, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, var(--primary-navy) 0%, var(--accent-blue) 100%)',
        color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--golden-yellow)', marginBottom: '0.2rem' }}>{breadcrumb}</div>
          <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{documentTitle}</div>
        </div>
        <div className="d-flex gap-2">
          {pdfUrl && !pdfUrl.startsWith('data:') && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>↗ New Tab</a>
          )}
          <button onClick={onClose} className="btn btn-ghost text-white" style={{ fontSize: '1.5rem', padding: '0 0.5rem' }}>✕</button>
        </div>
      </div>
      
      {/* Toolbar */}
      <div style={{
        backgroundColor: 'var(--white)', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-light)'
      }}>
        <button className="btn" style={{ padding: '0.2rem 0.8rem', background: '#f1f5f9' }} onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1}>◄ Prev</button>
        <span style={{ fontWeight: 500 }}>Page {pageNum} of {numPages || '-'}</span>
        <button className="btn" style={{ padding: '0.2rem 0.8rem', background: '#f1f5f9' }} onClick={() => setPageNum(p => Math.min(numPages, p + 1))} disabled={pageNum >= numPages}>Next ►</button>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-light)', margin: '0 0.5rem' }}></div>
        <button className="btn" style={{ padding: '0.2rem 0.8rem', background: '#f1f5f9' }} onClick={() => setScale(s => Math.max(0.5, s - 0.25))}>− Zoom</button>
        <span style={{ fontWeight: 500 }}>{Math.round(scale * 100)}%</span>
        <button className="btn" style={{ padding: '0.2rem 0.8rem', background: '#f1f5f9' }} onClick={() => setScale(s => Math.min(3, s + 0.25))}>Zoom +</button>
        {loading && <span style={{ marginLeft: '1rem', color: 'var(--accent-blue)', fontSize: '0.9rem' }}>Loading...</span>}
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        onClick={(e) => {
          if (e.target === containerRef.current) onClose();
        }}
        style={{
          flex: 1, backgroundColor: '#525659', overflow: 'auto',
          display: 'flex', justifyContent: 'center', padding: '2rem 0'
        }}
      >
        {error ? (
          <div className="card text-center" style={{ margin: 'auto', maxWidth: '400px' }}>
            <h3 className="text-red mb-2">⚠️ {error}</h3>
            {pdfUrl && !pdfUrl.startsWith('data:') && (
              <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-primary">Open PDF in New Tab ↗</a>
            )}
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            style={{ 
              backgroundColor: 'white', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              display: (pdfDoc && !error) ? 'block' : 'none'
            }} 
          />
        )}
      </div>
    </div>
  );
}
