// server/agents/scholarship/index.ts
import { db, schema } from 'hub:db'
import { eq, and, gte, lte, like, or } from 'drizzle-orm'

export interface StudentProfile {
  educationLevel?: string
  fieldOfStudy?: string
  targetCountries?: string[]
  academicBackground?: {
    gpa?: number
    standardizedTests?: { name: string, score: number }[]
  }
}

export interface ScholarshipCriteria {
  countries?: string[]
  educationLevel?: string[]
  fieldsOfStudy?: string[]
  minGPA?: number
  amount?: number
  deadline?: Date
}

/**
 * 🧠 AGENT IA - Conseiller Bourses
 * Système autonome avec capacités d'action
 */
export class ScholarshipAgent {
  private studentId: string
  private profile: StudentProfile | null = null
  private memory: {
    lastSearch?: any
    savedScholarships: string[]
    interactions: string[]
  }

  constructor(studentId: string) {
    this.studentId = studentId
    this.memory = {
      savedScholarships: [],
      interactions: []
    }
  }

  /**
   * 🔧 OUTIL : Charger le profil étudiant
   */
  async loadProfile(): Promise<StudentProfile | null> {
    const student = await db.query.students.findFirst({
      where: () => eq(schema.students.userId, this.studentId)
    })
    
    if (student) {
      this.profile = {
        educationLevel: student.educationLevel || undefined,
        fieldOfStudy: student.fieldOfStudy || undefined,
        targetCountries: student.targetCountries as string[] || [],
        academicBackground: student.academicBackground as any || {}
      }
    }
    
    this.memory.interactions.push(`Profil chargé : ${JSON.stringify(this.profile)}`)
    return this.profile
  }

  /**
   * 🔧 OUTIL : Rechercher des bourses
   */
  async searchScholarships(criteria: Partial<ScholarshipCriteria> = {}) {
    this.memory.interactions.push(`Recherche avec critères : ${JSON.stringify(criteria)}`)
    
    const scholarships = await db.query.scholarships.findMany({
      where: () => {
        const conditions = []
        
        // Critères de base
        if (criteria.countries?.length) {
          // TODO: Filtrer par pays dans le JSON eligibility
        }
        
        if (criteria.educationLevel?.length) {
          // TODO: Filtrer par niveau
        }
        
        if (criteria.minGPA) {
          // TODO: Filtrer par GPA minimum
        }
        
        // Bourses actives uniquement
        conditions.push(eq(schema.scholarships.isActive, true))
        
        // Deadline non dépassée
        if (criteria.deadline) {
          conditions.push(gte(schema.scholarships.deadline, criteria.deadline))
        }
        
        return and(...conditions)
      },
      limit: 50
    })
    
    this.memory.lastSearch = { criteria, results: scholarships.length }
    return scholarships
  }

  /**
   * 🔧 OUTIL : Calculer le score de match
   */
  async matchProfile(scholarshipId: string): Promise<number> {
    if (!this.profile) {
      await this.loadProfile()
    }
    
    const scholarship = await db.query.scholarships.findFirst({
      where: () => eq(schema.scholarships.id, scholarshipId)
    })
    
    if (!scholarship || !this.profile) return 0
    
    let score = 0
    const eligibility = scholarship.eligibility as any || {}
    
    // Pays correspondant
    if (eligibility.countries?.length && this.profile.targetCountries?.length) {
      const hasCommonCountry = eligibility.countries.some((c: string) => 
        this.profile!.targetCountries?.includes(c)
      )
      if (hasCommonCountry) score += 30
    }
    
    // Niveau d'études correspondant
    if (eligibility.educationLevel?.length && this.profile.educationLevel) {
      if (eligibility.educationLevel.includes(this.profile.educationLevel)) {
        score += 25
      }
    }
    
    // Domaine correspondant
    if (eligibility.fieldsOfStudy?.length && this.profile.fieldOfStudy) {
      if (eligibility.fieldsOfStudy.some((f: string) => 
        f.toLowerCase().includes(this.profile!.fieldOfStudy?.toLowerCase() || '')
      )) {
        score += 25
      }
    }
    
    // GPA
    if (eligibility.minGPA && this.profile.academicBackground?.gpa) {
      if (this.profile.academicBackground.gpa >= eligibility.minGPA) {
        score += 20
      }
    }
    
    return Math.min(score, 100)
  }

  /**
   * 🔧 OUTIL : Comparer plusieurs bourses
   */
  async compareScholarships(ids: string[]) {
    const scholarships = await db.query.scholarships.findMany({
      where: () => {
        // TODO: Filtrer par IDs
        return undefined
      }
    })
    
    const comparisons = await Promise.all(
      scholarships.map(async (s) => ({
        ...s,
        matchScore: await this.matchProfile(s.id)
      }))
    )
    
    return comparisons.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  /**
   * 🔧 OUTIL : Sauvegarder une bourse
   */
  async saveScholarship(scholarshipId: string) {
    if (!this.memory.savedScholarships.includes(scholarshipId)) {
      this.memory.savedScholarships.push(scholarshipId)
    }
    
    // TODO: Persister dans la base (table matches avec status 'saved')
    
    this.memory.interactions.push(`Bourse ${scholarshipId} sauvegardée`)
    return true
  }

  /**
   * 🎯 ACTION AUTONOME : Recommander les meilleures bourses
   */
  async recommend(): Promise<any[]> {
    this.memory.interactions.push('Démarrage recommandation autonome')
    
    // 1. Charger le profil
    await this.loadProfile()
    
    if (!this.profile) {
      return []
    }
    
    // 2. Rechercher les bourses correspondantes
    const scholarships = await this.searchScholarships({
      countries: this.profile.targetCountries,
      educationLevel: [this.profile.educationLevel || '']
    })
    
    // 3. Calculer les scores
    const scored = await Promise.all(
      scholarships.map(async (s) => ({
        ...s,
        matchScore: await this.matchProfile(s.id)
      }))
    )
    
    // 4. Trier et retourner le top 5
    const recommendations = scored
      .filter(s => s.matchScore > 50)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 5)
    
    this.memory.interactions.push(`Recommandation : ${recommendations.length} bourses trouvées`)
    
    return recommendations
  }

  /**
   * 💬 INTERACTION : Traiter un message utilisateur
   */
  async processMessage(message: string): Promise<{
    response: string
    actions: any[]
    data?: any
  }> {
    this.memory.interactions.push(`User: ${message}`)
    
    const lowerMessage = message.toLowerCase()
    
    // Détection d'intention simple
    if (lowerMessage.includes('recommand') || lowerMessage.includes('trouve') || lowerMessage.includes('cherche')) {
      const recommendations = await this.recommend()
      
      if (recommendations.length === 0) {
        return {
          response: "Je n'ai pas encore assez d'informations sur votre profil. Pouvez-vous me dire votre niveau d'études et votre domaine ?",
          actions: ['ask_profile']
        }
      }
      
      return {
        response: `J'ai analysé votre profil et trouvé ${recommendations.length} bourses pertinentes. Voici mes recommandations :`,
        actions: ['show_recommendations'],
        data: { recommendations }
      }
    }
    
    if (lowerMessage.includes('profil') || lowerMessage.includes('niveau')) {
      await this.loadProfile()
      
      if (this.profile) {
        return {
          response: `Voici votre profil actuel : Niveau ${this.profile.educationLevel}, Domaine ${this.profile.fieldOfStudy}, Pays cibles : ${this.profile.targetCountries?.join(', ')}`,
          actions: ['show_profile'],
          data: { profile: this.profile }
        }
      } else {
        return {
          response: "Je ne connais pas encore votre profil. Pouvez-vous me dire votre niveau d'études (Licence, Master, Doctorat) et votre domaine ?",
          actions: ['ask_profile']
        }
      }
    }
    
    // Réponse par défaut
    return {
      response: "Je suis votre conseiller en bourses d'élite. Je peux vous aider à trouver des opportunités correspondant à votre profil. Que souhaitez-vous faire ?\n\n• Découvrir des bourses\n• Voir votre profil\n• Comparer des bourses",
      actions: ['suggest_options']
    }
  }

  /**
   * 📊 Récupérer l'état de l'agent
   */
  getMemory() {
    return {
      profile: this.profile,
      savedScholarships: this.memory.savedScholarships,
      lastSearch: this.memory.lastSearch,
      interactionsCount: this.memory.interactions.length
    }
  }
}