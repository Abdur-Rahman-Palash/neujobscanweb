'use client'

import { useState, useEffect } from 'react'

export type Resume = {
  id: string
  name: string
  content?: string // simple text or base64 placeholder
  uploadDate: string
  atsScore: number
  status: 'active' | 'draft' | 'archived'
  matchCount: number
}

const STORAGE_KEY = 'nj_resumes_v1'

function seedSample(): Resume[] {
  return [
    {
      id: '1',
      name: 'Senior_Frontend_Developer_Resume.txt',
      content: 'Senior Frontend Developer\n\nSkills: React, TypeScript, Node.js, CSS\nExperience: 6 years\n',
      uploadDate: new Date().toISOString(),
      atsScore: 85,
      status: 'active',
      matchCount: 12
    },
    {
      id: '2',
      name: 'Full_Stack_Developer_Resume.txt',
      content: 'Full Stack Developer\n\nSkills: JavaScript, Python, AWS, PostgreSQL\nExperience: 4 years\n',
      uploadDate: new Date().toISOString(),
      atsScore: 78,
      status: 'active',
      matchCount: 8
    }
  ]
}

export default function useResumes() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = seedSample()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        setResumes(seed)
      } else {
        setResumes(JSON.parse(raw))
      }
    } catch (err) {
      console.error('useResumes load error', err)
      setResumes([])
    }
  }, [])

  function persist(next: Resume[]) {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setResumes(next)
    }
  }

  async function addResumeFile(file: File) {
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const reader = new FileReader()
    return new Promise<Resume>((resolve, reject) => {
      reader.onload = () => {
        const content = typeof reader.result === 'string' ? reader.result : ''
        const r: Resume = {
          id,
          name: file.name,
          content,
          uploadDate: new Date().toISOString(),
          atsScore: 70,
          status: 'active',
          matchCount: 0
        }
        const next = [r, ...resumes]
        persist(next)
        resolve(r)
      }
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  function addResumeObj(r: Omit<Resume, 'id' | 'uploadDate'>) {
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const nextR: Resume = { id, uploadDate: new Date().toISOString(), ...r }
    const next = [nextR, ...resumes]
    persist(next)
    return nextR
  }

  function deleteResume(id: string) {
    const next = resumes.filter(r => r.id !== id)
    persist(next)
  }

  function getContent(id: string) {
    return resumes.find(r => r.id === id)?.content
  }

  function downloadResume(id: string) {
    const r = resumes.find(r => r.id === id)
    if (!r) return
    const blob = new Blob([r.content ?? ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = r.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function reload() {
    if (mounted) {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setResumes(JSON.parse(raw))
    }
  }

  return {
    resumes,
    addResumeFile,
    addResumeObj,
    deleteResume,
    getContent,
    downloadResume,
    reload,
  }
}
