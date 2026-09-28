export type Intent =
  | 'get_total_classes_left'
  | 'get_classes_left_till_date'
  | 'get_subject_attendance'
  | 'get_needed_for_75'
  | 'get_needed_for_90'
  | 'get_bunks_left'
  | 'get_subject_bunks_left'
  | 'get_riskiest_subject'
  | 'check_irreversible_detention'
  | 'get_next_lab'
  | 'get_day_timetable'
  | 'get_week_timetable'
  | 'check_skip_date'
  | 'check_skip_range'
  | 'check_skip_next_n_classes'
  | 'explain_formula'
  | 'explain_irreversible_detention'
  | 'get_selected_section'
  | 'get_selected_plan_date'
  | 'get_input_mode'
  | 'get_safe_leave_suggestion'
  | 'get_most_frequent_subjects'
  | 'get_best_possible_attendance'
  | 'get_free_rooms_now'
  | 'get_free_rooms_at_time'
  | 'is_room_free'
  | 'fallback_unknown';

export interface ChatEntity {
  subjectCode?: string;
  subjectName?: string;
  date?: string;
  dateRange?: { from: string; to: string };
  classCount?: number;
  threshold?: 75 | 90;
  weekday?: string;
  roomId?: string;
  timeStr?: string;
}

export interface ChatbotContext {
  profileName: string | null;
  rollNumber: string | null;
  sectionKey: string;
  sectionLabel: string;
  planDate: string;
  mode: 'quick' | 'precise';
  inputs: { code: string; attended: number; conducted: number }[];
  plannedLeaves: string[];
  today: string;
  hasData: boolean;
}

export interface ChatbotResponse {
  text: string;
  followUps?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  followUps?: string[];
}

export interface IntentResult {
  intent: Intent;
  entities: ChatEntity;
}
