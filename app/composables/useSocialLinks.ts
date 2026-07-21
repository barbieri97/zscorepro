export type SocialKey = 'instagram' | 'linkedin' | 'twitter' | 'github'

export const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  author: 'Autor',
}

export const socialConfig: Record<SocialKey, { icon: string; color: string; toUrl: (v: string) => string }> = {
  instagram: {
    icon: 'i-simple-icons-instagram',
    color: 'text-pink-500',
    toUrl: (v) => v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`,
  },
  linkedin: {
    icon: 'i-simple-icons-linkedin',
    color: 'text-blue-600',
    toUrl: (v) => v.startsWith('http') ? v : `https://linkedin.com/in/${v}`,
  },
  twitter: {
    icon: 'i-simple-icons-x',
    color: '',
    toUrl: (v) => v.startsWith('http') ? v : `https://x.com/${v.replace(/^@/, '')}`,
  },
  github: {
    icon: 'i-simple-icons-github',
    color: '',
    toUrl: (v) => v.startsWith('http') ? v : `https://github.com/${v}`,
  },
}

export function socialLinks(member: Record<string, unknown>) {
  return (Object.keys(socialConfig) as SocialKey[])
    .filter(key => !!member[key])
    .map(key => ({
      key,
      url: socialConfig[key].toUrl(member[key] as string),
      icon: socialConfig[key].icon,
      color: socialConfig[key].color,
    }))
}
