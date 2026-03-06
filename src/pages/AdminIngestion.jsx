import { useState, useRef } from 'react'
import { Upload, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

const PLATFORMS = [
  { key: 'instagram',   label: 'Instagram',   color: '#E1306C', bg: 'bg-pink-50'   },
  { key: 'youtube',     label: 'YouTube',     color: '#FF0000', bg: 'bg-red-50'    },
  { key: 'spotify',     label: 'Spotify',     color: '#1DB954', bg: 'bg-green-50'  },
  { key: 'facebook',    label: 'Facebook',    color: '#1877F2', bg: 'bg-blue-50'   },
  { key: 'twitter',     label: 'Twitter / X', color: '#000000', bg: 'bg-gray-50'   },
]

const INITIAL_JOBS = [
  { id: 1, name: 'Instagram Sync',  platform: 'instagram', status: 'success', rows: 124, time: '2026-03-05 04:00', duration: '1m 12s' },
  { id: 2, name: 'YouTube Sync',    platform: 'youtube',   status: 'success', rows: 98,  time: '2026-03-05 04:02', duration: '58s'    },
  { id: 3, name: 'Spotify Sync',    platform: 'spotify',   status: 'failed',  rows: 0,   time: '2026-03-05 04:04', duration: '23s'    },
  { id: 4, name: 'Excel Import',    platform: 'manual',    status: 'success', rows: 310, time: '2026-03-04 11:30', duration: '2m 5s'  },
  { id: 5, name: 'Facebook Sync',   platform: 'facebook',  status: 'success', rows: 87,  time: '2026-03-04 04:00', duration: '1m 34s' },
]

const STATUS_META = {
  success: { icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-100',  label: 'Success' },
  failed:  { icon: XCircle,     color: 'text-red-600',    bg: 'bg-red-100',    label: 'Failed'  },
  running: { icon: RefreshCw,   color: 'text-blue-600',   bg: 'bg-blue-100',   label: 'Running' },
  pending: { icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
}

function AdminIngestion() {
  const [jobs, setJobs]           = useState(INITIAL_JOBS)
  const [syncing, setSyncing]     = useState({})
  const [dragOver, setDragOver]   = useState(false)
  const [uploadedFile, setFile]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const fileRef = useRef()

  function handleSync(platform) {
    setSyncing(p => ({ ...p, [platform.key]: true }))
    setTimeout(() => {
      setSyncing(p => ({ ...p, [platform.key]: false }))
      const newJob = {
        id:       jobs.length + 1,
        name:     `${platform.label} Sync`,
        platform: platform.key,
        status:   Math.random() > 0.2 ? 'success' : 'failed',
        rows:     Math.random() > 0.2 ? Math.floor(Math.random() * 150) + 50 : 0,
        time:     new Date().toISOString().replace('T', ' ').slice(0, 16),
        duration: `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 59)}s`,
      }
      setJobs(p => [newJob, ...p])
    }, 2500)
  }

  function handleFileDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (!file) return
    setFile(file)
  }

  function handleUpload() {
    if (!uploadedFile) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setUploadDone(true)
      const newJob = {
        id:       jobs.length + 1,
        name:     `Excel Import — ${uploadedFile.name}`,
        platform: 'manual',
        status:   'success',
        rows:     Math.floor(Math.random() * 300) + 100,
        time:     new Date().toISOString().replace('T', ' ').slice(0, 16),
        duration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 59)}s`,
      }
      setJobs(p => [newJob, ...p])
      setTimeout(() => {
        setFile(null)
        setUploadDone(false)
      }, 3000)
    }, 2000)
  }

  return (
    <div>
      <PageHeader
        title="Data Ingestion"
        subtitle="Sync platform data and upload Excel files"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Excel Upload */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-brand-navy mb-1">Excel Data Upload</h3>
          <p className="text-xs text-gray-400 mb-4">Upload .xlsx files for artist metrics, concerts or demographics</p>

          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-brand-blue bg-blue-50'
                : uploadedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-200 hover:border-brand-blue hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileDrop}
            />
            {uploadDone ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={32} className="text-green-500" />
                <p className="text-sm font-semibold text-green-600">Upload Successful!</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={28} className="text-green-500" />
                <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                <p className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-500">Drop your Excel file here</p>
                <p className="text-xs text-gray-400">or click to browse</p>
                <p className="text-xs text-gray-300 mt-1">.xlsx, .xls, .csv supported</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {uploadedFile && !uploadDone && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-3 bg-brand-navy text-white text-sm py-2.5 rounded-lg hover:bg-opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload & Import
                </>
              )}
            </button>
          )}

          {/* Template Download */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-brand-blue mt-0.5 flex-shrink-0" />
            <p className="text-xs text-brand-blue">
              Use the provided Excel template for correct column formatting.
              Sheets: <strong>Artist_Metrics</strong>, <strong>Concerts</strong>, <strong>Demographics</strong>
            </p>
          </div>
        </div>

        {/* Platform Sync */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-brand-navy mb-1">Platform API Sync</h3>
          <p className="text-xs text-gray-400 mb-4">Manually trigger a data sync for any connected platform</p>
          <div className="space-y-3">
            {PLATFORMS.map(platform => (
              <div key={platform.key} className={`flex items-center justify-between p-3 ${platform.bg} rounded-xl`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: platform.color }}
                  >
                    {platform.label[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{platform.label}</p>
                    <p className="text-xs text-gray-400">Last sync: Today 04:00</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSync(platform)}
                  disabled={syncing[platform.key]}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue transition disabled:opacity-60"
                >
                  <RefreshCw size={12} className={syncing[platform.key] ? 'animate-spin' : ''} />
                  {syncing[platform.key] ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Logs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-brand-navy">Ingestion Job Log</h3>
          <p className="text-xs text-gray-400 mt-0.5">Recent sync and import activity</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Job</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Rows</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Duration</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.map(job => {
              const meta = STATUS_META[job.status]
              const Icon = meta.icon
              return (
                <tr key={job.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-brand-navy">{job.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                      <Icon size={11} className={job.status === 'running' ? 'animate-spin' : ''} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{job.rows > 0 ? `${job.rows} rows` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{job.duration}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{job.time}</td>
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