import { useState, useRef } from 'react'
import { Upload, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

const PLATFORMS = [
  { key: 'instagram',  label: 'Instagram',   color: '#E1306C' },
  { key: 'youtube',    label: 'YouTube',     color: '#FF0000' },
  { key: 'spotify',    label: 'Spotify',     color: '#1DB954' },
  { key: 'facebook',   label: 'Facebook',    color: '#1877F2' },
  { key: 'twitter',    label: 'Twitter / X', color: '#000000' },
]

const INITIAL_JOBS = [
  { id: 1, name: 'Instagram Sync', status: 'success', rows: 124, time: '2026-03-05 04:00', duration: '1m 12s' },
  { id: 2, name: 'YouTube Sync',   status: 'success', rows: 98,  time: '2026-03-05 04:02', duration: '58s'    },
  { id: 3, name: 'Spotify Sync',   status: 'failed',  rows: 0,   time: '2026-03-05 04:04', duration: '23s'    },
  { id: 4, name: 'Excel Import',   status: 'success', rows: 310, time: '2026-03-04 11:30', duration: '2m 5s'  },
  { id: 5, name: 'Facebook Sync',  status: 'success', rows: 87,  time: '2026-03-04 04:00', duration: '1m 34s' },
]

const STATUS_META = {
  success: { icon: CheckCircle, color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.12)',  label: 'Success' },
  failed:  { icon: XCircle,     color: 'var(--accent-red)',   bg: 'rgba(239,68,68,0.12)',   label: 'Failed'  },
  running: { icon: RefreshCw,   color: 'var(--accent-indigo)',bg: 'rgba(99,102,241,0.12)', label: 'Running' },
  pending: { icon: Clock,       color: 'var(--accent-gold)',  bg: 'rgba(245,158,11,0.12)', label: 'Pending' },
}

function AdminIngestion() {
  const [jobs, setJobs]             = useState(INITIAL_JOBS)
  const [syncing, setSyncing]       = useState({})
  const [dragOver, setDragOver]     = useState(false)
  const [uploadedFile, setFile]     = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const fileRef = useRef()

  function handleSync(platform) {
    setSyncing(p => ({ ...p, [platform.key]: true }))
    setTimeout(() => {
      setSyncing(p => ({ ...p, [platform.key]: false }))
      setJobs(p => [{
        id:       p.length + 1,
        name:     `${platform.label} Sync`,
        status:   Math.random() > 0.2 ? 'success' : 'failed',
        rows:     Math.random() > 0.2 ? Math.floor(Math.random() * 150) + 50 : 0,
        time:     new Date().toISOString().replace('T', ' ').slice(0, 16),
        duration: `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 59)}s`,
      }, ...p])
    }, 2500)
  }

  function handleFileDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (file) setFile(file)
  }

  function handleUpload() {
    if (!uploadedFile) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setUploadDone(true)
      setJobs(p => [{
        id:       p.length + 1,
        name:     `Excel Import — ${uploadedFile.name}`,
        status:   'success',
        rows:     Math.floor(Math.random() * 300) + 100,
        time:     new Date().toISOString().replace('T', ' ').slice(0, 16),
        duration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 59)}s`,
      }, ...p])
      setTimeout(() => { setFile(null); setUploadDone(false) }, 3000)
    }, 2000)
  }

  return (
    <div>
      <PageHeader title="Data Ingestion" subtitle="Sync platform data and upload Excel files" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Upload */}
        <div className="glass-card p-5 animate-fade-up">
          <h3 className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Excel Data Upload</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Upload .xlsx files for artist metrics, concerts or demographics</p>

          <div onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current.click()}
            className="rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent-indigo)' : uploadedFile ? 'var(--accent-green)' : 'var(--border-strong)'}`,
              background: dragOver ? 'rgba(99,102,241,0.05)' : uploadedFile ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)'
            }}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileDrop} />
            {uploadDone ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={32} style={{ color: 'var(--accent-green)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>Upload Successful!</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={28} style={{ color: 'var(--accent-green)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{uploadedFile.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(uploadedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Drop your Excel file here</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>or click to browse · .xlsx .xls .csv</p>
              </div>
            )}
          </div>

          {uploadedFile && !uploadDone && (
            <button onClick={handleUpload} disabled={uploading}
              className="w-full mt-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
              {uploading ? <><RefreshCw size={14} className="animate-spin" /> Processing...</> : <><Upload size={14} /> Upload & Import</>}
            </button>
          )}

          <div className="mt-4 p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-indigo)' }} />
            <p className="text-xs" style={{ color: 'var(--accent-indigo)' }}>
              Use the provided template. Sheets: <strong>Artist_Metrics</strong>, <strong>Concerts</strong>, <strong>Demographics</strong>
            </p>
          </div>
        </div>

        {/* Platform Sync */}
        <div className="glass-card p-5 animate-fade-up delay-1">
          <h3 className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Platform API Sync</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Manually trigger a data sync for any connected platform</p>
          <div className="space-y-3">
            {PLATFORMS.map(platform => (
              <div key={platform.key} className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: platform.color }}>
                    {platform.label[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{platform.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last sync: Today 04:00</p>
                  </div>
                </div>
                <button onClick={() => handleSync(platform)} disabled={syncing[platform.key]}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 disabled:opacity-60"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-indigo)'; e.currentTarget.style.color = 'var(--accent-indigo)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <RefreshCw size={12} className={syncing[platform.key] ? 'animate-spin' : ''} />
                  {syncing[platform.key] ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Log */}
      <div className="glass-card overflow-hidden animate-fade-up delay-2">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Ingestion Job Log</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Recent sync and import activity</p>
        </div>
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['Job', 'Status', 'Rows', 'Duration', 'Time'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => {
              const meta = STATUS_META[job.status]
              const Icon = meta.icon
              return (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{job.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: meta.bg, color: meta.color }}>
                      <Icon size={10} className={job.status === 'running' ? 'animate-spin' : ''} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {job.rows > 0 ? `${job.rows} rows` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{job.duration}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{job.time}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminIngestion