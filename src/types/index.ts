export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'moderator';
  profile_image?: string;
  avatar?: string;
  points?: number;
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
}

export interface Course {
  id: string | number;
  title: string;
  description?: string;
  instructor?: string;
  instructor_id?: number;
  thumbnail?: string;
  price: number;
  rating?: number;
  students_count?: number;
  studentsCount?: number;
  duration_hours?: number;
  duration?: number;
  published?: boolean | number;
  created_at?: string;
  isEnrolled?: boolean;
  modules?: Module[];
}

export interface Module {
  id: string | number;
  course_id: number;
  title: string;
  order_index: number;
  videos?: Video[];
  quizzes?: Quiz[];
}

export interface Video {
  id: string | number;
  module_id: number;
  course_id: number;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  duration_seconds?: number;
  duration?: number;
  order_index?: number;
  courseName?: string;
  isSaved?: boolean;
}

export interface VideoProgress {
  id?: number;
  student_id?: number;
  video_id: number;
  current_position: number;
  duration: number;
  completion_percentage: number;
  completed: boolean;
  last_watched_at?: string;
  video?: Video;
  course?: Course;
}

export interface Quiz {
  id: string | number;
  course_id: number;
  module_id?: number;
  title: string;
  description?: string;
  passing_score: number;
  duration_minutes?: number;
  questions?: Question[];
}

export interface Question {
  id: string | number;
  quiz_id: number;
  question_text: string;
  order_index?: number;
  answers?: Answer[];
}

export interface Answer {
  id: string | number;
  question_id: number;
  answer_text: string;
  is_correct?: boolean;
}

export interface QuizAttempt {
  id: number;
  student_id: number;
  quiz_id: number;
  score: number;
  passed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface ForumPost {
  id: number;
  author_id: number;
  title: string;
  content: string;
  status: 'visible' | 'hidden' | 'deleted';
  views?: number;
  created_at: string;
  author?: User;
  comments_count?: number;
}

export interface ForumComment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  status: string;
  created_at: string;
  author?: User;
}

export interface Notification {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'quiz';
  is_read: boolean;
  is_global?: boolean;
  created_at: string;
}

export interface PlatformSetting {
  key: string;
  value: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  action: string;
  target_type?: string;
  target_id?: number;
  metadata?: string;
  created_at: string;
  user?: User;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  status: 'active' | 'completed' | 'suspended';
  enrolled_at: string;
  student?: User;
  course?: Course;
}

export interface Moderator {
  id: number;
  user_id: number;
  created_by: number;
  status: string;
  created_at: string;
  user?: User;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface DashboardStats {
  completedCourses: number;
  currentCourses: number;
  savedVideos: number;
  latestProgress?: VideoProgress & { video?: Video; course?: Course };
  weeklyActivity?: { day: string; minutes: number; prevMinutes: number }[];
  totalLearningMinutes?: number;
  videosWatched?: number;
  videosCompleted?: number;
  quizzesCompleted?: number;
  averageQuizScore?: number;
  recommendedCourses?: Course[];
}

export interface AdminDashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  publishedCourses: number;
  totalVideos: number;
  totalQuizzes: number;
  totalEnrollments: number;
  completedEnrollments: number;
  totalLearningHours: number;
  recentActivity?: ActivityLog[];
}
