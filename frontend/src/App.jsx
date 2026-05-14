import { useState } from "react";
import { processFile } from "./api";

export default function App() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(["[SYSTEM]: Awaiting hardware uplink..."]);
  const [imagePreview, setImagePreview] = useState(null);
  const [decryptedImagePreview, setDecryptedImagePreview] = useState(null);

  const addLog = (msg) => setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}]: ${msg}`, ...prev].slice(0, 15));

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const isEncrypted = selected.name.endsWith('.enc');
      addLog(`File detected: ${selected.name}`);
      addLog(`Payload Type: ${isEncrypted ? 'ENCRYPTED STREAM' : 'RAW DATA'}`);
      addLog("Integrity scan complete. Step 01 passed.");
      
      if (selected.type.startsWith('image/')) {
        const url = URL.createObjectURL(selected);
        setImagePreview(url);
      } else {
        setImagePreview(null);
      }
      setDecryptedImagePreview(null);
      
      setStep(2);
    }
  };

  const resetState = () => {
    setStep(1);
    setFile(null);
    setPassword("");
    setImagePreview(null);
    setDecryptedImagePreview(null);
  };

  const handleProcess = async () => {
    if (!file || !password) return;
    const isEncrypted = file.name.endsWith('.enc');
    const mode = isEncrypted ? 'decrypt' : 'encrypt';
    
    setIsProcessing(true);
    addLog(`Initiating ${mode}ion sequence...`);
    
    try {
      const blob = await processFile(file, password, mode);
      const url = window.URL.createObjectURL(blob);
      
      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name.replace(/\.enc$/, ""));

      if (mode === "decrypt" && isImage) {
        setDecryptedImagePreview(url);
        addLog(`DECRYPTION_SUCCESS: Image payload decrypted and displayed.`);
        setStep(4);
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = mode === "encrypt" ? `${file.name}.enc` : file.name.replace(/\.enc$/, "");
        link.click();
        
        // Wait briefly before revoking
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        
        addLog(`${mode.toUpperCase()}ION_SUCCESS: Payload released.`);
        
        setTimeout(() => {
          resetState();
        }, 2000);
      }
      
    } catch (err) {
      addLog(`CRITICAL ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    
    <div className="min-h-screen w-full bg-[#050505] text-cyan-500 font-mono flex flex-col overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Visual Identity */}
      <div className="flex-none pt-8 pb-4 text-center">
        <div className="text-4xl font-black tracking-tighter mb-1 glow-text">CRYPTVAULT</div>
        <div className="text-[10px] tracking-[0.3em] opacity-40 uppercase italic">Neural Encryption Interface</div>
      </div>

      {/* MAIN TERMINAL GRID */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-px bg-cyan-900/20 border-y border-cyan-900/30 relative">
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="text-sm font-black tracking-[0.2em] animate-pulse uppercase">Modifying Bitstream...</div>
            </div>
          </div>
        )}

        {/* Stage 1: Sidebar Navigation */}
        <div className="lg:col-span-2 bg-black/40 p-4 lg:p-8 flex flex-row lg:flex-col justify-center gap-4 lg:gap-12 overflow-x-auto items-center">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex flex-col items-center gap-2 lg:gap-3 transition-all duration-700 ${step === s ? 'opacity-100' : (step > s ? 'opacity-50' : 'opacity-20')} ${s === 4 && !decryptedImagePreview ? 'hidden' : ''}`}>
              <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full border flex items-center justify-center font-bold text-sm lg:text-lg shrink-0 ${step === s ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-cyan-950/30' : 'border-cyan-900'}`}>
                0{s}
              </div>
              <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-center">
                {s === 1 ? 'Ingest' : s === 2 ? 'Identity' : s === 3 ? 'Release' : 'Result'}
              </div>
            </div>
          ))}
        </div>

        {/* Stage 2: Interaction Terminal */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 lg:p-12 min-h-[400px] bg-gradient-to-b from-transparent to-cyan-950/5 relative">
          
          {/* Decorative Corner Brackets */}
          <div className="absolute top-4 left-4 lg:top-8 lg:left-8 w-6 h-6 lg:w-8 lg:h-8 border-t-2 border-l-2 border-cyan-900/50"></div>
          <div className="absolute top-4 right-4 lg:top-8 lg:right-8 w-6 h-6 lg:w-8 lg:h-8 border-t-2 border-r-2 border-cyan-900/50"></div>
          <div className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 w-6 h-6 lg:w-8 lg:h-8 border-b-2 border-l-2 border-cyan-900/50"></div>
          <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 w-6 h-6 lg:w-8 lg:h-8 border-b-2 border-r-2 border-cyan-900/50"></div>

          {step === 1 && (
            <div className="animate-in fade-in zoom-in duration-700 text-center space-y-10">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-500/40">Awaiting Source Packet</div>
              <label className="block p-10 lg:p-20 border-2 border-cyan-900/40 bg-black hover:bg-cyan-950/20 cursor-pointer transition-all border-dashed group relative overflow-hidden">
                <input type="file" className="hidden" onChange={handleFileSelect} />
                <span className="relative z-10 text-lg lg:text-xl tracking-[0.5em] font-black group-hover:text-white transition-all uppercase">Upload File</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-cyan-500"></div>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-10 duration-700 space-y-10 max-w-lg mx-auto w-full">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-500/40 text-center">Authorization Sequence</div>
              <div className="relative">
                <input 
                  autoFocus
                  required
                  type="password"
                  placeholder="ENTER PRIVATE KEY"
                  className="w-full bg-transparent border-b-2 border-cyan-900 p-4 lg:p-6 outline-none focus:border-cyan-500 text-2xl lg:text-3xl tracking-[0.2em] transition-all font-bold text-center"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && password.trim() !== "" && setStep(3)}
                />
                {password.length === 0 && (
                  <div className="text-[10px] lg:text-[12px] text-red-500 text-center mt-2 tracking-widest">
                    FIELD REQUIRED: SECRET KEY MISSING
                  </div>
                )}
              </div>
              <button 
                onClick={() => password.trim() !== "" ? setStep(3) : addLog("ERROR: Key Required")}
                disabled={password.trim() === ""}
                className="cursor-pointer w-full text-xs font-black border-2 border-cyan-500 py-4 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_25px_rgba(6,182,212,0.2)] tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONFIRM PASSWORD
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in-95 duration-700 space-y-8 lg:space-y-12 text-center max-w-xl mx-auto w-full">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-500/40">Ready To Transmit</div>
              
              <div className="p-6 lg:p-8 border border-cyan-900 bg-black/60 shadow-inner flex flex-col items-center">
                {imagePreview && (
                   <img src={imagePreview} alt="Preview" className="w-32 h-32 lg:w-48 lg:h-48 object-cover mb-4 border border-cyan-900/50 rounded" />
                )}
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 lg:mb-3">Loaded Asset ID</div>
                <div className="text-base lg:text-lg font-bold truncate tracking-widest uppercase w-full px-4">{file?.name}</div>
              </div>

              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className={`cursor-pointer w-full py-6 lg:py-10 border-2 font-black tracking-[0.2em] transition-all text-lg lg:text-xl
                  ${file?.name.endsWith('.enc') 
                    ? 'border-emerald-500 text-emerald-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] bg-emerald-950/5' 
                    : 'border-cyan-500 text-cyan-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] bg-cyan-950/5'}`}
              >
                {file?.name.endsWith('.enc') ? 'DECRYPT DATA' : 'ENCRYPT DATA'}
              </button>
              
              <button 
                onClick={resetState} 
                className="text-[10px] lg:text-[12px] uppercase tracking-[0.2em] transition-opacity underline decoration-cyan-900 cursor-pointer block w-full text-center"
              >
                Abort Mission
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in zoom-in-95 duration-700 space-y-8 lg:space-y-12 text-center max-w-xl mx-auto w-full">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-500/40">Payload Decrypted</div>
              
              <div className="p-4 lg:p-8 border border-emerald-900 bg-black/60 shadow-inner flex flex-col items-center">
                <img src={decryptedImagePreview} alt="Decrypted" className="max-w-full h-auto max-h-48 lg:max-h-64 object-contain mb-4 border border-emerald-900/50 rounded" />
                <div className="text-[10px] uppercase tracking-widest text-emerald-600 mb-2 lg:mb-3">Decrypted Asset ID</div>
                <div className="text-base lg:text-lg font-bold truncate tracking-widest uppercase text-emerald-500 w-full px-4">{file?.name.replace(/\.enc$/, "")}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = decryptedImagePreview;
                    link.download = file.name.replace(/\.enc$/, "");
                    link.click();
                  }}
                  className="flex-1 py-4 border-2 font-black tracking-[0.1em] lg:tracking-[0.2em] transition-all text-xs lg:text-sm border-emerald-500 text-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] bg-emerald-950/5"
                >
                  SAVE IMAGE
                </button>
                <button 
                  onClick={resetState}
                  className="flex-1 py-4 border-2 font-black tracking-[0.1em] lg:tracking-[0.2em] transition-all text-xs lg:text-sm border-cyan-500 text-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] bg-cyan-950/5"
                >
                  START OVER
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stage 3: Live Output Streams */}
        <div className="lg:col-span-3 bg-black/80 flex flex-col overflow-hidden min-h-[300px] border-t lg:border-t-0 lg:border-l border-cyan-900/30">
          <div className="flex-1 p-6 lg:p-8 overflow-hidden flex flex-col">
            <div className="flex-none text-[11px] font-black text-cyan-900 uppercase mb-4 lg:mb-6 tracking-[0.2em] border-b border-cyan-900/30 pb-2">Telemetry Feed</div>
            
            {/* LOG CONTAINER */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {terminalLogs.map((log, i) => (
                <div key={i} className="text-[10px] lg:text-[11px] leading-relaxed break-all font-medium border-l-2 border-cyan-900 pl-4 py-2 bg-cyan-950/10 animate-in fade-in slide-in-from-left-2">
                  <span className="opacity-30 text-[8px] lg:text-[9px]">{log.split(']: ')[0]}]:</span>
                  <br />
                  <span className="text-cyan-400/90">{log.split(']: ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-none p-6 lg:p-8 border-t border-cyan-900/30 bg-black">
            <div className="text-[10px] opacity-30 uppercase tracking-[0.2em] mb-3">Node Connectivity</div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    <div className="text-[10px] lg:text-[11px] font-black tracking-widest uppercase">Encrypted Uplink</div>
                </div>
            </div>
          </div>
        </div>

      </div>

      {/* Fullscreen Footer */}
      <footer className="flex-none py-6 text-center">
        <div className="inline-flex items-center gap-4 lg:gap-6 px-6 lg:px-10 py-3 bg-[#0a0a0a] rounded-full border border-cyan-900/40 shadow-2xl group hover:border-cyan-500 transition-all flex-wrap justify-center mx-4">
          <p className="text-[8px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-colors">
              Made with <i className="fas fa-heart text-red-500" /> by
            <a href="https://abhishekshah-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="mx-1 text-cyan-500 transition-colors hover:text-purple-400">
              Abhishek Shah
            </a> 
          </p>
        </div>
      </footer>
    </div>
  );
}