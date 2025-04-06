export type UserRole = "voter" | "committee";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  voter_id: string | null;
  name: string;
  created_at: string;
}

export interface Election {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  election_id: string;
  voter_id: string;
  candidate_id: string;
  created_at: string;
}

export interface ElectionResult {
  candidate_id: string;
  candidate_name: string;
  vote_count: number;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      elections: {
        Row: Election;
        Insert: Omit<Election, "id" | "created_at">;
        Update: Partial<Omit<Election, "id" | "created_at">>;
      };
      candidates: {
        Row: Candidate;
        Insert: Omit<Candidate, "id" | "created_at">;
        Update: Partial<Omit<Candidate, "id" | "created_at">>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, "id" | "created_at">;
        Update: Partial<Omit<Vote, "id" | "created_at">>;
      };
    };
    Functions: {
      get_election_results: {
        Args: { election_id: string };
        Returns: ElectionResult[];
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
};
