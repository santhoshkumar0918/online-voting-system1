export type UserRole = "voter" | "committee";

export interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  status: "draft" | "active" | "completed";
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Vote {
  id?: string;
  election_id: string;
  voter_id: string;
  candidate_id: string;
  created_at?: string;
}

export interface ElectionWithCandidates extends Election {
  candidates: Candidate[];
}

export interface ElectionResult {
  candidate_id: string;
  candidate_name: string;
  vote_count: number;
}
