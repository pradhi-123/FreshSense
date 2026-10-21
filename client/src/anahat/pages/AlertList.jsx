import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, postAlertAction } from '../api.js';
import { useAnahat } from '../AnahatContext.jsx';
import socket from '../socket.js';
import { AlertTriangle, Bell, ChevronRight, Clock, RefreshCw, CheckCircle, Shield } from 'lucide-react';
import '../anahat.css';

const CHIP = { SAID:'chip-said', HOW:'chip-how', HR:'chip-hr' };
const STATUS_BD = { new:'bd-red', in_progress:'bd-amber', closed:'bd-green' };
function ago(d) {
  const ms=Date.now()-new Date(d);
  const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
  if(h>48)return`${Math.floor(h/24)}D`;if(h>0)return`${h}H`;return`${m}M`;
}
function SectionHdr({children}){return(<div className="an-section-hdr"><span className="an-sec">{children}</span><div className="an-section-hdr-line"/></div>);}

export default function AlertList() {
  const navigate = useNavigate();
  const { refreshDemo } = useAnahat();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d=await getAlerts(); setAlerts(d); refreshDemo(); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    socket.on('alert:new',     data => { setAlerts(prev=>[data,...prev]); refreshDemo(); });
    socket.on('alert:updated', data => { setAlerts(prev=>prev.map(a=>a.id===data.id?{...a,status:data.status}:a)); });
    return () => { socket.off('alert:new'); socket.off('alert:updated'); };
  }, []);

  const filtered = filter==='all' ? alerts : alerts.filter(a=>a.status===filter);
  const counts = {
    new:alerts.filter(a=>a.status==='new').length,
    in_progress:alerts.filter(a=>a.status==='in_progress').length,
    closed:alerts.filter(a=>a.status==='closed').length,
  };

  const handleAction = async () => {
    if(!modal) return; setSaving(true);
    try { await postAlertAction(modal.alertId,modal.type,note); setModal(null); setNote(''); await load(); }
    catch {}
    setSaving(false);
  };

  return (
    <div className="an-page an-fade">
      {/* Header */}
      <div className="an-flex-between mb24">
        <div>
          <div className="an-h1">Welfare Alerts</div>
          <div className="an-sub mt8">TRIANGULATION · ≥2 OF 3 SIGNAL GROUPS · 5-DAY WINDOW</div>
        </div>
        <button className="an-btn an-btn-ghost an-btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={13} style={{animation:loading?'spin 0.65s linear infinite':'none'}}/>
        </button>
      </div>

      {/* Signal legend */}
      <SectionHdr>Signal Groups</SectionHdr>
      <div className="grid3 mb20">
        {[{chip:'SAID',cls:'chip-said',label:'What they said'},{chip:'HOW',cls:'chip-how',label:'Tone / Delivery'},{chip:'HR',cls:'chip-hr',label:'HR Records'}].map(s=>(
          <div key={s.chip} className="an-card an-card-sm an-flex g10">
            <span className={`chip ${s.cls}`}>{s.chip}</span>
            <span style={{fontSize:12,color:'var(--tx2)'}}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid4 mb20">
        {[
          {label:'NEW',val:counts.new,color:'var(--red)'},
          {label:'IN PROGRESS',val:counts.in_progress,color:'var(--amber)'},
          {label:'CLOSED',val:counts.closed,color:'var(--green)'},
          {label:'TOTAL',val:alerts.length,color:'var(--tx)'},
        ].map(s=>(
          <div key={s.label} className="an-stat">
            <div className="an-stat-label">{s.label}</div>
            <div className="an-stat-val" style={{color:s.color,fontSize:s.val>99?22:28}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="an-flex g6 mb16">
        {['all','new','in_progress','closed'].map(f=>(
          <button key={f} className={`an-btn an-btn-sm ${filter===f?'an-btn-primary':'an-btn-ghost'}`} onClick={()=>setFilter(f)} style={{fontSize:10,letterSpacing:'0.1em'}}>
            {f.replace('_',' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{textAlign:'center',padding:80,color:'var(--tx3)'}}>
          <div className="an-spin" style={{width:36,height:36,margin:'0 auto 12px'}}/>
          <div style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'0.1em'}}>LOADING…</div>
        </div>
      ) : filtered.length===0 ? (
        <div className="an-card" style={{textAlign:'center',padding:80}}>
          <Shield size={30} style={{color:'var(--tx4)',marginBottom:10}}/>
          <div style={{color:'var(--tx3)',fontFamily:'var(--mono)',fontSize:11,letterSpacing:'0.1em'}}>NO ALERTS</div>
        </div>
      ) : (
        <div className="an-flex-col g8">
          {filtered.map(a=>(
            <div key={a.id} className={`an-alert-row${a.status==='new'?' new-alert':''}`} onClick={()=>navigate(`/anahat/alerts/${a.id}`)}>
              {/* Status indicator */}
              <div style={{width:38,height:38,borderRadius:'var(--r)',background:a.status==='new'?'var(--rd)':'var(--s3)',border:`1px solid ${a.status==='new'?'var(--rd-b)':'var(--b2)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <AlertTriangle size={16} style={{color:a.status==='new'?'var(--red)':'var(--tx3)'}}/>
              </div>

              <div style={{flex:1,minWidth:0}}>
                <div className="an-flex-wrap g6 mb6">
                  <span style={{fontWeight:800,fontSize:13.5,letterSpacing:'0.04em'}}>{a.pseudonym}</span>
                  <span className="an-mono" style={{fontSize:10,color:'var(--tx3)',letterSpacing:'0.08em'}}>{a.unit} · {a.platoon}</span>
                  {(a.groups||[]).map(g=><span key={g} className={`chip ${CHIP[g]||''}`}>{g}</span>)}
                  <span className={`an-badge ${STATUS_BD[a.status]||'bd-muted'}`}>{a.status.replace('_',' ')}</span>
                </div>
                <div style={{fontSize:11.5,color:'var(--tx2)',marginBottom:8}}>
                  {(a.reasons||[]).slice(0,2).map((r,i)=><div key={i} style={{fontFamily:'var(--mono)',fontSize:10.5,letterSpacing:'0.02em',marginBottom:2}}>▸ {r}</div>)}
                </div>
                {a.suggested?.length>0&&(
                  <div className="an-flex-wrap g6">
                    {a.suggested.map((s,i)=>(
                      <button key={i} className="an-btn an-btn-sm an-btn-ghost" style={{fontSize:10,padding:'4px 10px',letterSpacing:'0.08em'}}
                        onClick={e=>{e.stopPropagation();setModal({alertId:a.id,type:s.replace(/ /g,'_')});}}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                <div className="an-flex g4 an-mono" style={{fontSize:10,color:'var(--tx3)'}}><Clock size={10}/>{ago(a.created_at)}</div>
                <ChevronRight size={14} style={{color:'var(--tx4)'}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick-action Modal */}
      {modal&&(
        <div className="an-overlay" onClick={()=>setModal(null)}>
          <div className="an-modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:14,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:6}}>Log Action</div>
            <div className="mb16"><span className="an-badge bd-gold">{modal.type.replace(/_/g,' ')}</span></div>
            <label className="an-label">Action note</label>
            <textarea className="an-input" rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe action taken…" style={{resize:'vertical',marginBottom:14}}/>
            <div className="an-flex g8">
              <button className="an-btn an-btn-ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</button>
              <button className="an-btn an-btn-primary" style={{flex:1}} onClick={handleAction} disabled={saving}>
                {saving?'SAVING…':<><CheckCircle size={12}/> CONFIRM</>}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
