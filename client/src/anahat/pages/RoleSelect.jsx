import React, { useState } from 'react';
import { useAnahat } from '../AnahatContext.jsx';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Star, ArrowRight, Lock } from 'lucide-react';
import '../anahat.css';

const ROLES = [
  { id:'personnel',       icon:<User size={22}/>,   label:'Personnel',       code:'OP-PERS', sub:'Constable / Junior Officer', color:'#3a7bd5', dim:'rgba(58,123,213,0.1)', border:'rgba(58,123,213,0.3)' },
  { id:'welfare_officer', icon:<Shield size={22}/>, label:'Welfare Officer', code:'OP-WLF',  sub:'Senior / Subedar',           color:'#d48c10', dim:'rgba(212,140,16,0.1)', border:'rgba(212,140,16,0.3)' },
  { id:'commander',       icon:<Star size={22}/>,   label:'Commander',       code:'OP-CMD',  sub:'CO / Commandant',            color:'#2a9d5c', dim:'rgba(42,157,92,0.1)',  border:'rgba(42,157,92,0.3)' },
];

export default function RoleSelect() {
  const { setRole, setPersonnelId } = useAnahat();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(null);
  const [pid, setPid] = useState('p017');
  const now = new Date();

  const proceed = () => {
    if (!chosen) return;
    setRole(chosen);
    if (chosen === 'personnel') { setPersonnelId(pid); navigate('/anahat/checkin'); }
    else if (chosen === 'welfare_officer') navigate('/anahat/alerts');
    else navigate('/anahat/unit');
  };

  const role = ROLES.find(r => r.id === chosen);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative' }}>

      {/* Grid texture */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }}/>

      <div className="an-fade" style={{ width:'100%', maxWidth:680, position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          {/* Corner brackets */}
          <div style={{ display:'inline-block', position:'relative', padding:'24px 32px', marginBottom:8 }}>
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
              <div key={v+h} style={{
                position:'absolute', [v]:0, [h]:0,
                width:16, height:16,
                borderTop: v==='top' ? '2px solid var(--gold)' : 'none',
                borderBottom: v==='bottom' ? '2px solid var(--gold)' : 'none',
                borderLeft: h==='left' ? '2px solid var(--gold)' : 'none',
                borderRight: h==='right' ? '2px solid var(--gold)' : 'none',
              }}/>
            ))}
            <div style={{ fontSize:36, fontWeight:900, letterSpacing:'0.28em', color:'var(--gold)', textShadow:'0 0 40px rgba(201,162,39,0.35)', textTransform:'uppercase' }}>
              ANAHAT
            </div>
          </div>
          <div style={{ fontSize:10, color:'var(--tx3)', letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'var(--mono)', marginBottom:12 }}>
            Anonymous Welfare · Intelligence System
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--grn)', border:'1px solid var(--grn-b)', borderRadius:'var(--r)', padding:'4px 12px', fontSize:10, color:'var(--green)', fontFamily:'var(--mono)', letterSpacing:'0.1em' }}>
            <span style={{ width:5,height:5,borderRadius:'50%',background:'var(--green)' }}/>
            SYSTEM ONLINE · {now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()}
          </div>
        </div>

        {/* Role cards */}
        <div className="grid3 mb28">
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setChosen(r.id)} style={{
              background: chosen===r.id ? r.dim : 'var(--s1)',
              border: `1px solid ${chosen===r.id ? r.border : 'var(--b1)'}`,
              borderRadius:'var(--r2)', padding:'24px 18px',
              cursor:'pointer', textAlign:'center', fontFamily:'var(--font)',
              transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:12,
              transform: chosen===r.id ? 'translateY(-3px)' : 'none',
              boxShadow: chosen===r.id ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${r.border}` : 'none',
              position:'relative', overflow:'hidden',
            }}>
              {chosen===r.id && <div style={{ position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,${r.color},transparent)` }}/>}
              {/* Code tag */}
              <div style={{ position:'absolute',top:8,right:10,fontSize:8,color:chosen===r.id?r.color:'var(--tx4)',fontFamily:'var(--mono)',letterSpacing:'0.1em' }}>
                {r.code}
              </div>
              <div style={{ width:52,height:52,borderRadius:4,background:r.dim,border:`1px solid ${r.border}`,display:'flex',alignItems:'center',justifyContent:'center',color:r.color }}>
                {r.icon}
              </div>
              <div style={{ fontWeight:800,fontSize:13.5,color:'var(--tx)',textTransform:'uppercase',letterSpacing:'0.06em' }}>{r.label}</div>
              <div style={{ fontSize:10,color:'var(--tx3)',fontFamily:'var(--mono)' }}>{r.sub}</div>
            </button>
          ))}
        </div>

        {/* Personnel ID */}
        {chosen === 'personnel' && (
          <div className="an-card mb16" style={{ animation:'fadeIn 0.2s ease' }}>
            <label className="an-label">Personnel ID</label>
            <select className="an-select" value={pid} onChange={e => setPid(e.target.value)}>
              {Array.from({length:40},(_,i) => {
                const n = String(i+1).padStart(3,'0');
                return <option key={n} value={`p${n}`}>PERS-{n}</option>;
              })}
            </select>
          </div>
        )}

        {/* CTA */}
        <button
          className={`an-btn an-btn-lg an-btn-full ${chosen ? 'an-btn-primary' : 'an-btn-ghost'}`}
          onClick={proceed} disabled={!chosen}
          style={{ letterSpacing:'0.12em' }}
        >
          {chosen ? `ACCESS AS ${role?.label?.toUpperCase()}` : 'SELECT ROLE TO AUTHENTICATE'}
          {chosen && <ArrowRight size={16}/>}
        </button>

        <div style={{ textAlign:'center', marginTop:14, fontSize:10, color:'var(--tx4)', fontFamily:'var(--mono)', letterSpacing:'0.1em' }}>
          RESTRICTED ACCESS · AUTHORISED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
}
