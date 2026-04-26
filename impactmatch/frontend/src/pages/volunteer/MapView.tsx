import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Loader2, Map, AlertTriangle, Users, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import 'leaflet/dist/leaflet.css';

interface MapPoint {
  location: string;
  lat: number;
  lng: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  openNeeds: number;
  fulfilledNeeds: number;
  activeVolunteers: number;
}

const URGENCY_STYLES: Record<
  MapPoint['urgencyLevel'],
  { fillColor: string; radius: number; fillOpacity: number; label: string; emoji: string }
> = {
  critical: { fillColor: '#ef4444', radius: 28, fillOpacity: 0.5,  label: 'Critical need areas',    emoji: '🔴' },
  high:     { fillColor: '#f97316', radius: 22, fillOpacity: 0.45, label: 'High need areas',         emoji: '🟠' },
  medium:   { fillColor: '#eab308', radius: 16, fillOpacity: 0.40, label: 'Medium need areas',       emoji: '🟡' },
  low:      { fillColor: '#14b8a6', radius: 12, fillOpacity: 0.35, label: 'Active/low need areas',   emoji: '🟢' },
};

const POPUP_BADGE: Record<MapPoint['urgencyLevel'], string> = {
  critical: 'background:#ef4444;color:#fff',
  high:     'background:#f97316;color:#fff',
  medium:   'background:#eab308;color:#0a0f1e',
  low:      'background:#14b8a6;color:#0a0f1e',
};

const capitalize = (s: string) =>
  s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function VolunteerMapView() {
  const navigate = useNavigate();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/map/data');
        setPoints(res.data.data);
      } catch {
        toast.error('Failed to load map data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalHotspots   = points.length;
  const criticalAreas   = points.filter(p => p.urgencyLevel === 'critical').length;
  const totalVolunteers = points.reduce((s, p) => s + p.activeVolunteers, 0);
  const totalOpenNeeds  = points.reduce((s, p) => s + p.openNeeds, 0);

  const statCards = [
    { label: 'Total Hotspots',    value: totalHotspots,  icon: Layers,        color: 'text-slate-400',  bg: 'bg-slate-500/10'  },
    { label: 'Critical Areas',     value: criticalAreas,  icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/10'    },
    { label: 'Active Volunteers',  value: totalVolunteers, icon: Users,        color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Open Needs',         value: totalOpenNeeds,  icon: Map,          color: 'text-brand-400',  bg: 'bg-brand-500/10'  },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Impact Map</h1>
          <p className="text-slate-400 mt-1">Explore community needs across Bangalore</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className={`card animate-slide-up stagger-${i + 1}`}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className="font-display text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-slate-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map area */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-accent-500" />
        </div>
      ) : (
        <div className="glass overflow-hidden" style={{ borderRadius: 16 }}>
          <style>{`
            .leaflet-popup-content-wrapper {
              background: #1e293b !important;
              border: 1px solid rgba(255,255,255,0.1) !important;
              color: #e2e8f0 !important;
              border-radius: 12px !important;
              box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
            }
            .leaflet-popup-tip { background: #1e293b !important; }
            .leaflet-popup-content { margin: 12px 16px !important; }
            .leaflet-container { font-family: "DM Sans", sans-serif; }
          `}</style>

          <div
            style={{
              position: 'relative',
              height: 'calc(100vh - 280px)',
              minHeight: 420,
              zIndex: 0,
            }}
          >
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={11}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="© OpenStreetMap contributors © CARTO"
              />

              {points.map((pt) => {
                const style = URGENCY_STYLES[pt.urgencyLevel];
                return (
                  <CircleMarker
                    key={pt.location}
                    center={[pt.lat, pt.lng]}
                    radius={style.radius}
                    pathOptions={{
                      fillColor: style.fillColor,
                      fillOpacity: style.fillOpacity,
                      color: style.fillColor,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 8 }}>
                          {capitalize(pt.location)}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          ...Object.fromEntries(
                            POPUP_BADGE[pt.urgencyLevel].split(';').map(s => s.split(':'))
                          ),
                        }}>
                          {pt.urgencyLevel}
                        </span>
                        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
                          <div>📋 Open Needs: <strong style={{ color: '#f1f5f9' }}>{pt.openNeeds}</strong></div>
                          <div>👥 Active Volunteers: <strong style={{ color: '#14b8a6' }}>{pt.activeVolunteers}</strong></div>
                          <div>✅ Fulfilled: <strong style={{ color: '#f1f5f9' }}>{pt.fulfilledNeeds}</strong></div>
                        </div>
                        <button
                          onClick={() => navigate('/volunteer')}
                          style={{
                            marginTop: 12,
                            width: '100%',
                            padding: '6px 0',
                            background: '#f97316',
                            color: '#0a0f1e',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            letterSpacing: '0.03em',
                          }}
                        >
                          View Tasks →
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Legend overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                right: 16,
                zIndex: 1000,
                background: 'rgba(15,23,42,0.88)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '12px 16px',
                minWidth: 190,
                backdropFilter: 'blur(12px)',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Legend
              </div>
              {(Object.keys(URGENCY_STYLES) as MapPoint['urgencyLevel'][]).map(lvl => (
                <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: 12, color: '#e2e8f0' }}>
                  <span>{URGENCY_STYLES[lvl].emoji}</span>
                  <span>{URGENCY_STYLES[lvl].label}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 8, fontSize: 11, color: '#64748b' }}>
                ⭕ Circle size = intensity
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
