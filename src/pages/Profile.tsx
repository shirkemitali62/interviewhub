import { useState, useEffect } from 'react'
import { User, Mail, Link as LinkIcon, Save, Phone, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Navbar } from '../components/layout/Navbar'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { if (data) setProfile(data); setLoading(false) })
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id, ...profile, updated_at: new Date().toISOString()
    })
    if (error) toast.error('Failed to save profile')
    else toast.success('Profile updated!')
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update your personal information</p>
        </div>
        <Card className="mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {profile.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{profile.full_name || 'Your Name'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </Card>
        <Card className="space-y-5">
          <Input label="Full Name" type="text" placeholder="Your full name"
            value={profile.full_name || ''}
            onChange={(e: any) => setProfile((p: any) => ({ ...p, full_name: e.target.value }))}
            icon={<User size={16} />} />
          <Input label="Email" type="email" value={user?.email || ''} disabled
            icon={<Mail size={16} />} />
          <Input label="Phone Number" type="tel" placeholder="9876543210"
            value={profile.phone || ''}
            onChange={(e: any) => setProfile((p: any) => ({ ...p, phone: e.target.value }))}
            icon={<Phone size={16} />} />
          <Input label="Location" type="text" placeholder="Pune, Maharashtra"
            value={profile.location || ''}
            onChange={(e: any) => setProfile((p: any) => ({ ...p, location: e.target.value }))}
            icon={<MapPin size={16} />} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target Role</label>
            <select value={profile.target_role || ''}
              onChange={(e) => setProfile((p: any) => ({ ...p, target_role: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select target role</option>
              {['Frontend Developer','Backend Developer','Full Stack Developer','Java Developer','Python Developer','Data Analyst','DevOps Engineer','HR Round'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Years of Experience</label>
            <select value={profile.experience_years || 0}
              onChange={(e) => setProfile((p: any) => ({ ...p, experience_years: Number(e.target.value) }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[0,1,2,3,4,5,6,7,8,9,10].map(y => (
                <option key={y} value={y}>{y === 0 ? 'Fresher' : `${y} year${y > 1 ? 's' : ''}`}</option>
              ))}
            </select>
          </div>
          <Input label="LinkedIn URL" type="url" placeholder="https://linkedin.com/in/yourname"
            value={profile.linkedin_url || ''}
            onChange={(e: any) => setProfile((p: any) => ({ ...p, linkedin_url: e.target.value }))}
            icon={<LinkIcon size={16} />} />
          <Input label="GitHub URL" type="url" placeholder="https://github.com/yourusername"
            value={profile.github_url || ''}
            onChange={(e: any) => setProfile((p: any) => ({ ...p, github_url: e.target.value }))}
           icon={<LinkIcon size={16} />} />
          <Button onClick={handleSave} loading={saving} fullWidth>
            <Save size={16} /> Save Profile
          </Button>
        </Card>
      </div>
    </div>
  )
}