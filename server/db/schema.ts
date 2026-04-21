import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
}

// =============================================
// TABLE USERS
// =============================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  username: text('username').notNull(),
  provider: text('provider').notNull(), // 'github', 'google', 'email'
  providerId: text('provider_id').notNull(),
  password: text('password'), // null pour OAuth, hashé pour email
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
}, table => [
  uniqueIndex('users_provider_id_idx').on(table.provider, table.providerId),
  uniqueIndex('users_email_idx').on(table.email)
])

// =============================================
// TABLE STUDENTS (Extension du profil utilisateur)
// =============================================
export const students = sqliteTable('students', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  
  // Informations académiques de base
  educationLevel: text('education_level'), // 'high_school', 'undergrad', 'grad', 'phd'
  fieldOfStudy: text('field_of_study'),    // 'Computer Science', 'Engineering', etc.
  
  // Cibles et aspirations (stockés en JSON)
  targetCountries: text('target_countries', { mode: 'json' }).$type<string[]>(),
  targetUniversities: text('target_universities', { mode: 'json' }).$type<string[]>(),
  
  // Background détaillé (stocké en JSON)
  academicBackground: text('academic_background', { mode: 'json' }).$type<{
    gpa?: number
    gpaScale?: number
    standardizedTests?: { name: string, score: number }[]
    courses?: string[]
    institutions?: string[]
  }>(),
  
  extracurricular: text('extracurricular', { mode: 'json' }).$type<{
    projects?: { name: string, description?: string, url?: string }[]
    volunteering?: { organization: string, role?: string, duration?: string }[]
    internships?: { company: string, role?: string, duration?: string }[]
    awards?: { name: string, issuer?: string, year?: number }[]
    publications?: { title: string, venue?: string, year?: number }[]
  }>(),
  
  // Préférences et contraintes
  languages: text('languages', { mode: 'json' }).$type<{ language: string, level: string }[]>(),
  budgetConstraint: integer('budget_constraint'), // en USD, annuel
  preferredRegion: text('preferred_region'),      // 'north_america', 'europe', 'asia', etc.
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
}, table => [
  index('students_user_id_idx').on(table.userId),
  index('students_education_level_idx').on(table.educationLevel),
  index('students_field_of_study_idx').on(table.fieldOfStudy)
])

// =============================================
// TABLE SCHOLARSHIPS (Bourses)
// =============================================
export const scholarships = sqliteTable('scholarships', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Informations de base
  name: text('name').notNull(),
  provider: text('provider').notNull(), // 'MIT', 'Stanford', 'Gates Foundation', etc.
  description: text('description'),
  url: text('url'),
  
  // Critères d'éligibilité (JSON)
  eligibility: text('eligibility', { mode: 'json' }).$type<{
    countries?: string[]           // Pays éligibles
    educationLevel?: string[]      // Niveaux acceptés
    fieldsOfStudy?: string[]       // Domaines acceptés
    minGPA?: number                // GPA minimum
    maxBudget?: number             // Couverture maximale
    requiredLanguages?: { language: string, level: string }[]
    citizenshipRequired?: string[] // Nationalités requises
  }>(),
  
  // Détails de la bourse
  amount: integer('amount'),                    // Montant en USD
  coverage: text('coverage'),                   // 'full_tuition', 'partial', 'stipend'
  duration: text('duration'),                   // '1_year', '2_years', 'full_program'
  deadline: integer('deadline', { mode: 'timestamp' }),
  
  // Statistiques
  competitiveness: text('competitiveness'),     // 'low', 'medium', 'high', 'extreme'
  successRate: integer('success_rate'),         // Pourcentage (0-100)
  
  // Métadonnées
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('scholarships_name_idx').on(table.name),
  index('scholarships_provider_idx').on(table.provider),
  index('scholarships_deadline_idx').on(table.deadline),
  index('scholarships_is_active_idx').on(table.isActive)
])

// =============================================
// TABLE MATCHES (Recommandations personnalisées)
// =============================================
export const matches = sqliteTable('matches', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  scholarshipId: text('scholarship_id').notNull().references(() => scholarships.id, { onDelete: 'cascade' }),
  
  // Score et analyse
  matchScore: integer('match_score').notNull(),        // 0-100
  confidenceLevel: text('confidence_level').notNull(), // 'low', 'medium', 'high'
  
  // Raisons du matching (JSON)
  matchReasons: text('match_reasons', { mode: 'json' }).$type<{
    strengths: string[]    // Points forts du profil par rapport à la bourse
    gaps: string[]         // Points à améliorer
    tips: string[]         // Conseils pour maximiser les chances
  }>(),
  
  // Statut de la candidature
  status: text('status').notNull().default('recommended'), // 'recommended', 'applied', 'shortlisted', 'awarded', 'rejected', 'archived'
  
  // Suivi
  appliedAt: integer('applied_at', { mode: 'timestamp' }),
  notes: text('notes'), // Notes personnelles de l'étudiant
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('matches_student_id_idx').on(table.studentId),
  index('matches_scholarship_id_idx').on(table.scholarshipId),
  index('matches_status_idx').on(table.status),
  index('matches_match_score_idx').on(table.matchScore)
])

// =============================================
// TABLE CHATS (Conversations)
// =============================================
export const chats = sqliteTable('chats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Typage pour le routing éducatif
  chatType: text('chat_type').default('general'), // 'general', 'coaching', 'admission', 'scholarship', 'academic'
  
  // Métadonnées contextuelles
  context: text('context', { mode: 'json' }).$type<{
    scholarshipId?: string    // Si conversation liée à une bourse spécifique
    universityId?: string     // Si conversation liée à une université
    subject?: string          // Sujet académique si tutoring
  }>(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('chats_user_id_idx').on(table.userId),
  index('chats_chat_type_idx').on(table.chatType)
])

// =============================================
// TABLE MESSAGES
// =============================================
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  parts: text('parts', { mode: 'json' }),
  
  // Métadonnées structurées pour l'analyse
  metadata: text('metadata', { mode: 'json' }).$type<{
    intent?: string            // Intention détectée
    entities?: Record<string, any> // Entités extraites
    tokensUsed?: number        // Tokens consommés
    modelUsed?: string         // Modèle utilisé
  }>(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('messages_chat_id_idx').on(table.chatId),
  index('messages_role_idx').on(table.role)
])

// =============================================
// RELATIONS
// =============================================

// Users
export const usersRelations = relations(users, ({ many, one }) => ({
  chats: many(chats),
  student: one(students, {
    fields: [users.id],
    references: [students.userId]
  })
}))

// Students
export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id]
  }),
  matches: many(matches)
}))

// Scholarships
export const scholarshipsRelations = relations(scholarships, ({ many }) => ({
  matches: many(matches)
}))

// Matches
export const matchesRelations = relations(matches, ({ one }) => ({
  student: one(students, {
    fields: [matches.studentId],
    references: [students.id]
  }),
  scholarship: one(scholarships, {
    fields: [matches.scholarshipId],
    references: [scholarships.id]
  })
}))

// Chats
export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id]
  }),
  messages: many(messages)
}))

// Messages
export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  })
}))